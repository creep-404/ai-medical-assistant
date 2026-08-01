from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum, ForeignKey, Date, Text
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
