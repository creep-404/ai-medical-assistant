from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.database import get_db
from backend.models.user import User, DoctorProfile, UserRole
from backend.schemas.user import DoctorProfilePublicResponse, DoctorPublicUser

router = APIRouter()

MAX_LIMIT = 100


def _to_public(profile: DoctorProfile) -> DoctorProfilePublicResponse:
    data = DoctorProfilePublicResponse.model_validate(profile)
    data.user = DoctorPublicUser.model_validate(profile.user)
    return data


@router.get("/doctors", response_model=List[DoctorProfilePublicResponse])
def list_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=MAX_LIMIT),
    specialty: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(DoctorProfile)
        .join(User)
        .filter(User.is_active == True, User.role == UserRole.doctor)
    )
    if specialty:
        query = query.filter(DoctorProfile.specialty.ilike(f"%{specialty}%"))
    profiles = query.offset(skip).limit(limit).all()
    return [_to_public(p) for p in profiles]


@router.get("/doctors/{doctor_id}", response_model=DoctorProfilePublicResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    profile = (
        db.query(DoctorProfile)
        .join(User)
        .filter(
            DoctorProfile.user_id == doctor_id,
            User.is_active == True,
            User.role == UserRole.doctor,
        )
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return _to_public(profile)


@router.get("/doctors/search", response_model=List[DoctorProfilePublicResponse])
def search_doctors(
    query_str: str = Query(..., alias="q", min_length=1, max_length=100),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=MAX_LIMIT),
    db: Session = Depends(get_db),
):
    profiles = (
        db.query(DoctorProfile)
        .join(User)
        .filter(
            User.is_active == True,
            User.role == UserRole.doctor,
            (
                User.full_name.ilike(f"%{query_str}%")
                | DoctorProfile.specialty.ilike(f"%{query_str}%")
                | DoctorProfile.hospital_name.ilike(f"%{query_str}%")
            ),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_to_public(p) for p in profiles]
