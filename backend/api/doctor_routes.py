from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.database import get_db
from backend.models.user import User, DoctorProfile, UserRole
from backend.schemas.user import DoctorProfileResponse, UserResponse

router = APIRouter()


@router.get("/doctors", response_model=List[DoctorProfileResponse])
def list_doctors(
    skip: int = 0,
    limit: int = 50,
    specialty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(DoctorProfile).join(User).filter(User.is_active == True)
    if specialty:
        query = query.filter(DoctorProfile.specialty.ilike(f"%{specialty}%"))
    profiles = query.offset(skip).limit(limit).all()

    result = []
    for profile in profiles:
        profile_data = DoctorProfileResponse.model_validate(profile)
        profile_data.user = UserResponse.model_validate(profile.user)
        result.append(profile_data)
    return result


@router.get("/doctors/{doctor_id}", response_model=DoctorProfileResponse)
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

    profile_data = DoctorProfileResponse.model_validate(profile)
    profile_data.user = UserResponse.model_validate(profile.user)
    return profile_data


@router.get("/doctors/search", response_model=List[DoctorProfileResponse])
def search_doctors(
    query_str: str = Query(..., alias="q"),
    db: Session = Depends(get_db),
):
    profiles = (
        db.query(DoctorProfile)
        .join(User)
        .filter(
            User.is_active == True,
            (
                User.full_name.ilike(f"%{query_str}%")
                | DoctorProfile.specialty.ilike(f"%{query_str}%")
                | DoctorProfile.hospital_name.ilike(f"%{query_str}%")
            ),
        )
        .all()
    )

    result = []
    for profile in profiles:
        profile_data = DoctorProfileResponse.model_validate(profile)
        profile_data.user = UserResponse.model_validate(profile.user)
        result.append(profile_data)
    return result
