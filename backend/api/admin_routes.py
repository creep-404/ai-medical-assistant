from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.models.user import User, UserRole, DoctorProfile
from backend.auth.auth_handler import get_current_user, hash_password
from backend.auth.password_policy import validate_password_strength
from backend.schemas.user import (
    AdminDoctorCreate,
    AdminUserStatusUpdate,
    DoctorProfileResponse,
    UserResponse,
)

router = APIRouter()


def _require_admin(current_user: User) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


@router.get("/admin/users", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    users = db.query(User).order_by(User.id).offset(skip).limit(limit).all()
    return users


@router.patch("/admin/users/{user_id}/status", response_model=UserResponse)
def set_user_active(
    user_id: int,
    payload: AdminUserStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/admin/doctors",
    response_model=DoctorProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_doctor(
    payload: AdminDoctorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)

    email = payload.email.lower()
    existing = db.query(User).filter(
        (User.email == email) | (User.username == payload.username)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email or username already exists",
        )

    try:
        validate_password_strength(payload.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    # Server-assigned role: only admins can create doctor accounts.
    # Doctors are NOT verified until an admin approves them (approval workflow).
    user = User(
        email=email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=UserRole.doctor,
        token_version=0,
    )
    db.add(user)
    db.flush()

    profile = DoctorProfile(
        user_id=user.id,
        specialty=payload.specialty,
        license_number=payload.license_number,
        experience_years=payload.experience_years,
        qualification=payload.qualification,
        hospital_name=payload.hospital_name,
        consultation_fee=payload.consultation_fee,
        bio=payload.bio,
        is_verified=False,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return profile


@router.patch("/admin/doctors/{user_id}/approve", response_model=DoctorProfileResponse)
def approve_doctor(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    profile = (
        db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )
    profile.is_verified = True
    db.commit()
    db.refresh(profile)
    return profile
