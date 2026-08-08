from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum, ForeignKey, Date, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database.database import Base


class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="userrole"), default=UserRole.patient, nullable=False)
    is_active = Column(Boolean, default=True)
    token_version = Column(Integer, default=0, nullable=False)
    reset_token_hash = Column(String(64), nullable=True)
    reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    appointments_as_patient = relationship("Appointment", back_populates="patient", foreign_keys="Appointment.patient_id", cascade="all, delete-orphan")
    appointments_as_doctor = relationship("Appointment", back_populates="doctor", foreign_keys="Appointment.doctor_id", cascade="all, delete-orphan")
    medicine_reminders = relationship("MedicineReminder", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    medical_reports = relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    """Server-side record of issued refresh tokens for rotation and revocation."""

    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


class OAuthAccount(Base):
    """A third-party identity (Google/GitHub) linked to a user account.

    One user may have multiple provider identities, and one provider identity
    is always unique. Linking is keyed by (provider, provider_account_id); the
    email address on the User row is the source of truth for account linking.
    """

    __tablename__ = "oauth_accounts"
    __table_args__ = (
        UniqueConstraint("provider", "provider_account_id",
                         name="uq_oauth_provider_account"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(20), nullable=False)
    provider_account_id = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="oauth_accounts")


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)

    user = relationship("User", back_populates="patient_profile")


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialty = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    experience_years = Column(Integer, default=0)
    qualification = Column(String(255), nullable=True)
    hospital_name = Column(String(255), nullable=True)
    available_days = Column(String(255), nullable=True)
    available_time_start = Column(String(10), nullable=True)
    available_time_end = Column(String(10), nullable=True)
    consultation_fee = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    user = relationship("User", back_populates="doctor_profile")
