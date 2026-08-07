import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.user import User, UserRole, RefreshToken
from backend.auth.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from backend.auth.password_policy import validate_password_strength
from backend.auth.rate_limiter import (
    RateLimiter,
    client_ip,
    make_forgot_limiter,
    make_login_limiter,
    make_register_limiter,
    make_refresh_limiter,
)
from backend.config import settings
from backend.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshToken as RefreshTokenSchema,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from backend.services.email_service import send_password_reset_email

router = APIRouter()

RESET_TOKEN_TTL_MINUTES = 30

_login_limiter: RateLimiter | None = None
_register_limiter: RateLimiter | None = None
_refresh_limiter: RateLimiter | None = None
_forgot_limiter: RateLimiter | None = None


def _get_login_limiter() -> RateLimiter:
    global _login_limiter
    if _login_limiter is None:
        _login_limiter = make_login_limiter()
    return _login_limiter


def _get_register_limiter() -> RateLimiter:
    global _register_limiter
    if _register_limiter is None:
        _register_limiter = make_register_limiter()
    return _register_limiter


def _get_refresh_limiter() -> RateLimiter:
    global _refresh_limiter
    if _refresh_limiter is None:
        _refresh_limiter = make_refresh_limiter()
    return _refresh_limiter


def _get_forgot_limiter() -> RateLimiter:
    global _forgot_limiter
    if _forgot_limiter is None:
        _forgot_limiter = make_forgot_limiter()
    return _forgot_limiter


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    common = {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "path": "/",
    }
    if settings.COOKIE_DOMAIN:
        common["domain"] = settings.COOKIE_DOMAIN
    response.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **common)
    response.set_cookie("refresh_token", refresh_token, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **common)


def _clear_auth_cookies(response: Response) -> None:
    common = {"httponly": True, "secure": settings.COOKIE_SECURE, "samesite": settings.COOKIE_SAMESITE, "path": "/"}
    if settings.COOKIE_DOMAIN:
        common["domain"] = settings.COOKIE_DOMAIN
    response.delete_cookie("access_token", **common)
    response.delete_cookie("refresh_token", **common)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _issue_tokens(response: Response, user: User) -> dict:
    """Mint access+refresh tokens, persist the refresh token, and set cookies."""
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value,
            "ver": user.token_version,
            "jti": secrets.token_urlsafe(16),
        }
    )
    refresh_raw = secrets.token_urlsafe(48)
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "role": user.role.value, "ver": user.token_version, "jti": refresh_raw}
    )
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_record = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh_token),
        expires_at=expires_at,
    )
    # Store via a session bound to this request. We fetch the DB here.
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "db_record": db_record,
    }


def _make_token_response(user: User, access_token: str, refresh_token: str) -> TokenResponse:
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    _get_register_limiter().check(client_ip(request))

    existing = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists",
        )

    try:
        validate_password_strength(user_data.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    # Server-assigned role: public self-registration is always a patient.
    # Doctors are created by admins only; admins are bootstrapped by env config.
    user = User(
        email=user_data.email.lower(),
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=UserRole.patient,
        token_version=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    tokens = _issue_tokens(response, user)
    db.add(tokens["db_record"])
    db.commit()

    _set_auth_cookies(response, tokens["access_token"], tokens["refresh_token"])
    return _make_token_response(user, tokens["access_token"], tokens["refresh_token"])


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: UserLogin,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = client_ip(request)
    limiter = _get_login_limiter()
    limiter.check(ip)

    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username.lower())
    ).first()

    # Always verify against a dummy hash to avoid trivial timing-based enumeration.
    dummy_hash = hash_password("not-a-real-password-value")

    if not user or not verify_password(login_data.password, user.hashed_password or dummy_hash):
        limiter.register_failure(ip)
        if user:
            limiter.register_failure(f"user:{user.id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    limiter.reset(ip)
    if user:
        limiter.reset(f"user:{user.id}")

    tokens = _issue_tokens(response, user)
    db.add(tokens["db_record"])
    db.commit()

    _set_auth_cookies(response, tokens["access_token"], tokens["refresh_token"])
    return _make_token_response(user, tokens["access_token"], tokens["refresh_token"])


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    response: Response,
    request: Request,
    token_data: RefreshTokenSchema | None = None,
    db: Session = Depends(get_db),
):
    _get_refresh_limiter().check(client_ip(request))

    provided = token_data.refresh_token if token_data else None
    if not provided:
        provided = request.cookies.get("refresh_token")
    if not provided:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required",
        )

    payload = decode_token(provided)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    token_hash = _hash_token(provided)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored is None:
        # Reuse of a rotated/revoked token: revoke the whole user session.
        if payload.get("sub"):
            db.query(RefreshToken).filter(RefreshToken.user_id == int(payload["sub"])).delete()
            user_rec = db.query(User).filter(User.id == int(payload["sub"])).first()
            if user_rec:
                user_rec.token_version += 1
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or already used",
        )

    if stored.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        db.delete(stored)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    user = db.query(User).filter(User.id == stored.user_id).first()
    if not user or not user.is_active:
        db.delete(stored)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    if payload.get("ver") != user.token_version:
        db.delete(stored)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked",
        )

    # Rotate: delete the old refresh token, issue a fresh pair.
    db.delete(stored)
    db.commit()

    tokens = _issue_tokens(response, user)
    db.add(tokens["db_record"])
    db.commit()

    _set_auth_cookies(response, tokens["access_token"], tokens["refresh_token"])
    return _make_token_response(user, tokens["access_token"], tokens["refresh_token"])


@router.post("/logout")
def logout(
    response: Response,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.token_version += 1
    db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).delete()
    db.commit()
    _clear_auth_cookies(response)
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    _get_forgot_limiter().check(client_ip(request))

    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Do not reveal whether an account exists.
        return {"message": "If the email exists, a reset link has been sent"}

    # One-time random token, stored only as a hash, with expiry.
    raw_token = secrets.token_urlsafe(48)
    user.reset_token_hash = _hash_token(raw_token)
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    db.commit()

    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
    send_password_reset_email(user.email, reset_url)

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token = payload.token
    new_password = payload.password

    if not token or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token and password are required",
        )

    try:
        validate_password_strength(new_password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    token_hash = _hash_token(token)
    user = db.query(User).filter(User.reset_token_hash == token_hash).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    if not user.reset_token_expires_at or user.reset_token_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Single-use: clear the token, revoke all sessions.
    user.hashed_password = hash_password(new_password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    user.token_version += 1
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).delete()
    db.commit()
    return {"message": "Password reset successful"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
