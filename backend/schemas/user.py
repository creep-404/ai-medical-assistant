from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum


class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"


class UserCreate(BaseModel):
    email: str = Field(..., max_length=255)
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., max_length=255)
    role: UserRole = UserRole.patient


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshToken(BaseModel):
    refresh_token: str


class PatientProfileCreate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientProfileResponse(BaseModel):
    id: int
    user_id: int
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

    class Config:
        from_attributes = True


class DoctorProfileCreate(BaseModel):
    specialty: str
    license_number: str
    experience_years: Optional[int] = 0
    qualification: Optional[str] = None
    hospital_name: Optional[str] = None
    available_days: Optional[str] = None
    available_time_start: Optional[str] = None
    available_time_end: Optional[str] = None
    consultation_fee: Optional[float] = 0.0
    bio: Optional[str] = None


class DoctorProfileResponse(BaseModel):
    id: int
    user_id: int
    specialty: str
    license_number: str
    experience_years: Optional[int] = 0
    qualification: Optional[str] = None
    hospital_name: Optional[str] = None
    available_days: Optional[str] = None
    available_time_start: Optional[str] = None
    available_time_end: Optional[str] = None
    consultation_fee: Optional[float] = 0.0
    is_verified: bool = False
    bio: Optional[str] = None
    rating: Optional[float] = 0.0
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
