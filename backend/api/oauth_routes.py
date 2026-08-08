"""OAuth 2.0 / OpenID Connect for Google and GitHub.

Flow:
  1. GET /api/auth/oauth/{provider}/start -> returns authorize_url
     (signed `state` embeds provider + nonce, so it survives serverless).
  2. Provider redirects browser to the callback with `code` + `state`.
  3. Backend validates the signed `state`, exchanges the code, fetches the
     provider identity, links/creates the account, issues the same JWT
     cookies as the password login, and redirects into the app.

Linking rules (no duplicates):
  - Match by (provider, provider_account_id) first (idempotent relogin).
  - Else match by verified email (case-insensitive) against existing users
    and link the provider to that account WITHOUT touching its password.
  - Else create a new patient account with an unusable random password
    (login is only possible through the provider until reset or link).
"""

import secrets
from datetime import datetime, timedelta, timezone

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from backend.api.auth_routes import _hash_token, _set_auth_cookies
from backend.auth import auth_handler
from backend.auth.auth_handler import create_access_token, create_refresh_token
from backend.auth.rate_limiter import client_ip, make_login_limiter
from backend.config import settings
from backend.database.database import get_db
from backend.models.user import OAuthAccount, RefreshToken, User, UserRole

router = APIRouter()

SUPPORTED_PROVIDERS = ("google", "github")
_OAUTH_STATE_TTL = timedelta(minutes=10)

GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_SCOPES = "openid%20email%20profile"
GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"

_login_limiter = None


def _get_login_limiter():
    global _login_limiter
    if _login_limiter is None:
        _login_limiter = make_login_limiter()
    return _login_limiter


def _is_configured(provider: str) -> bool:
    if provider == "google":
        return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    if provider == "github":
        return bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET)
    return False


def _credentials(provider: str) -> tuple[str, str]:
    if provider == "google":
        return settings.GOOGLE_CLIENT_ID, settings.GOOGLE_CLIENT_SECRET
    return settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET


def _callback_url(provider: str) -> str:
    return f"{settings.PUBLIC_API_URL.rstrip('/')}/api/auth/oauth/{provider}/callback"


def _sign_state(provider: str) -> str:
    payload = {
        "type": "oauth_state",
        "provider": provider,
        "nonce": secrets.token_urlsafe(24),
        "exp": datetime.now(timezone.utc) + _OAUTH_STATE_TTL,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _verify_state(state: str | None, provider: str) -> None:
    if not state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing OAuth state")
    try:
        payload = jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")
    if payload.get("type") != "oauth_state" or payload.get("provider") != provider:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")


def _authorize_url(provider: str, state: str) -> str:
    client_id, _ = _credentials(provider)
    redirect_uri = _callback_url(provider)
    if provider == "google":
        qs = (
            f"client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
            f"&scope={GOOGLE_SCOPES}&state={state}&prompt=select_account"
        )
        return f"{GOOGLE_AUTHORIZE_URL}?{qs}"
    return (
        f"{GITHUB_AUTHORIZE_URL}?client_id={client_id}&redirect_uri={redirect_uri}"
        f"&scope=user:email&state={state}"
    )


def _google_identity(code: str, redirect_uri: str) -> dict:
    client_id, client_secret = _credentials("google")
    token_resp = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        },
        timeout=15,
    )
    token_resp.raise_for_status()
    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Provider token exchange failed")
    info_resp = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=15,
    )
    info_resp.raise_for_status()
    profile = info_resp.json()
    if not profile.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your Google email is not verified.",
        )
    return {
        "provider_account_id": str(profile.get("sub")),
        "email": (profile.get("email") or "").lower(),
        "full_name": profile.get("name") or "",
    }


def _github_identity(code: str, redirect_uri: str) -> dict:
    client_id, client_secret = _credentials("github")
    token_resp = httpx.post(
        GITHUB_TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        },
        headers={"Accept": "application/json"},
        timeout=15,
    )
    token_resp.raise_for_status()
    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Provider token exchange failed")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }
    user_resp = httpx.get(f"{GITHUB_API_URL}/user", headers=headers, timeout=15)
    user_resp.raise_for_status()
    profile = user_resp.json()

    email = (profile.get("email") or "").lower()
    if not email:
        emails_resp = httpx.get(f"{GITHUB_API_URL}/user/emails", headers=headers, timeout=15)
        if emails_resp.status_code == 200:
            for entry in emails_resp.json():
                if entry.get("primary") and entry.get("verified"):
                    email = (entry.get("email") or "").lower()
                    break
    return {
        "provider_account_id": str(profile.get("id")),
        "email": email,
        "full_name": profile.get("name") or profile.get("login") or "",
    }


def _derive_username(email: str, db: Session) -> str:
    base = "".join(c for c in email.split("@")[0].lower() if c.isalnum() or c in "._-")[:64]
    base = base or "user"
    candidate, n = base, 2
    while db.query(User).filter(User.username == candidate).first():
        candidate = f"{base}{n}"
        n += 1
    return candidate


def _link_or_create_user(
    db: Session, provider: str, provider_account_id: str, email: str, full_name: str
) -> User:
    existing = (
        db.query(OAuthAccount)
        .filter(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == str(provider_account_id),
        )
        .first()
    )
    if existing:
        user = db.query(User).filter(User.id == existing.user_id).first()
        if user:
            return user
        db.delete(existing)
        db.flush()

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provider did not return a verified email for this account.",
        )

    # Existing account with the same email -> link, never touch its password.
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.add(
            OAuthAccount(
                user_id=user.id,
                provider=provider,
                provider_account_id=str(provider_account_id),
                email=email,
            )
        )
        db.commit()
        return user

    # New account: patient, unusable random password hash (no real credential
    # is ever overwritten; password reset remains available).
    user = User(
        email=email,
        username=_derive_username(email, db),
        hashed_password=auth_handler.hash_password(secrets.token_urlsafe(48)),
        full_name=(full_name or email.split("@")[0]).strip() or "OAuth User",
        role=UserRole.patient,
        token_version=0,
    )
    db.add(user)
    db.flush()
    db.add(
        OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_account_id=str(provider_account_id),
            email=email,
        )
    )
    db.commit()
    return user


@router.get("/oauth/{provider}/start")
def oauth_start(provider: str, request: Request) -> dict:
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown provider: {provider}")
    if not _is_configured(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{provider.capitalize()} sign-in is not configured on this server.",
        )
    return {"authorize_url": _authorize_url(provider, _sign_state(provider))}


@router.get("/oauth/{provider}/callback")
def oauth_callback(
    provider: str,
    request: Request,
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    _get_login_limiter().check(client_ip(request))
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown provider: {provider}")
    if not _is_configured(provider):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{provider.capitalize()} sign-in is not configured on this server.",
        )

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth could not be completed (provider error: {error}).",
        )
    _verify_state(state, provider)
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing authorization code")

    redirect_uri = _callback_url(provider)
    identity = (
        _google_identity(code, redirect_uri)
        if provider == "google"
        else _github_identity(code, redirect_uri)
    )

    user = _link_or_create_user(
        db,
        provider,
        identity["provider_account_id"],
        identity["email"],
        identity["full_name"],
    )
    _get_login_limiter().reset(client_ip(request))

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
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(refresh_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()

    login_url = f"{settings.FRONTEND_URL.rstrip('/')}/login?oauth=success"
    redirect = RedirectResponse(url=login_url, status_code=status.HTTP_302_FOUND)
    _set_auth_cookies(redirect, access_token, refresh_token)
    return redirect