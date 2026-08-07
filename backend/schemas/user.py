from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import date, datetime
from enum import Enum


class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"


class UserCreate(BaseModel):
    # Client may NOT supply a role. The server always assigns "patient".
    email: EmailStr = Field(..., max_length=255)
    username: str = Field(..., min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(..., min_length=12, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)


class UserLogin(BaseModel):
    username: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
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


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., max_length=512)
    password: str = Field(..., min_length=12, max_length=128)


class AdminDoctorCreate(BaseModel):
    """Admin-created doctor account (approved workflow)."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(..., min_length=12, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    specialty: str = Field(..., min_length=1, max_length=255)
    license_number: str = Field(..., min_length=1, max_length=100)
    experience_years: Optional[int] = Field(default=0, ge=0, le=70)
    qualification: Optional[str] = Field(default=None, max_length=255)
    hospital_name: Optional[str] = Field(default=None, max_length=255)
    consultation_fee: Optional[float] = Field(default=0.0, ge=0, le=1_000_000)
    bio: Optional[str] = Field(default=None, max_length=2000)


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


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
    specialty: str = Field(..., min_length=1, max_length=255)
    license_number: str = Field(..., min_length=1, max_length=100)
    experience_years: Optional[int] = Field(default=0, ge=0, le=70)
    qualification: Optional[str] = Field(default=None, max_length=255)
    hospital_name: Optional[str] = Field(default=None, max_length=255)
    available_days: Optional[str] = Field(default=None, max_length=255)
    available_time_start: Optional[str] = Field(default=None, max_length=10)
    available_time_end: Optional[str] = Field(default=None, max_length=10)
    consultation_fee: Optional[float] = Field(default=0.0, ge=0, le=1_000_000)
    bio: Optional[str] = Field(default=None, max_length=2000)


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
    lat: Optional[float] = None
    lng: Optional[float] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class DoctorPublicUser(BaseModel):
    """Minimal user object nested in public doctor responses. No email/phone."""

    id: int
    full_name: str
    username: str

    class Config:
        from_attributes = True


class DoctorProfilePublicResponse(BaseModel):
    """Public-facing doctor view. Deliberately omits email and license number."""

    id: int
    user_id: int
    specialty: str
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
    lat: Optional[float] = None
    lng: Optional[float] = None
    user: Optional[DoctorPublicUser] = None

    class Config:
        from_attributes = True
