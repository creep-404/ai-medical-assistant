from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum, ForeignKey, Date, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database.database import Base


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


disease_symptom_association = Table(
    "disease_symptom",
    Base.metadata,
    Column("disease_id", Integer, ForeignKey("diseases.id"), primary_key=True),
    Column("symptom_id", Integer, ForeignKey("symptoms.id"), primary_key=True),
)

disease_medicine_association = Table(
    "disease_medicine",
    Base.metadata,
    Column("disease_id", Integer, ForeignKey("diseases.id"), primary_key=True),
    Column("medicine_id", Integer, ForeignKey("medicines.id"), primary_key=True),
)


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_emergency = Column(Boolean, default=False)

    diseases = relationship("Disease", secondary=disease_symptom_association, back_populates="symptoms")


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    causes = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    precautions = Column(Text, nullable=True)
    home_remedies = Column(Text, nullable=True)
    recovery_time = Column(String(100), nullable=True)
    diet_suggestions = Column(Text, nullable=True)
    hydration_advice = Column(Text, nullable=True)
    when_to_see_doctor = Column(Text, nullable=True)

    symptoms = relationship("Symptom", secondary=disease_symptom_association, back_populates="diseases")
    medicines = relationship("Medicine", secondary=disease_medicine_association, back_populates="diseases")
    predictions = relationship("Prediction", back_populates="disease", foreign_keys="Prediction.predicted_disease")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    medicine_type = Column(String(100), nullable=True)
    dosage = Column(String(255), nullable=True)
    age_group = Column(String(100), nullable=True)
    side_effects = Column(Text, nullable=True)
    food_interaction = Column(Text, nullable=True)
    usage_instructions = Column(Text, nullable=True)

    diseases = relationship("Disease", secondary=disease_medicine_association, back_populates="medicines")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symptoms = Column(Text, nullable=False)
    predicted_disease = Column(String(255), ForeignKey("diseases.name"), nullable=True)
    confidence = Column(Float, nullable=True)
    was_emergency = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")
    disease = relationship("Disease", back_populates="predictions", foreign_keys=[predicted_disease])
    medical_reports = relationship("MedicalReport", back_populates="prediction", cascade="all, delete-orphan")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(String(10), nullable=False)
    status = Column(Enum(AppointmentStatus, name="appointmentstatus"), default=AppointmentStatus.pending)
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    clinic = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", back_populates="appointments_as_patient", foreign_keys=[patient_id])
    doctor = relationship("User", back_populates="appointments_as_doctor", foreign_keys=[doctor_id])


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_url = Column(String(500), nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", back_populates="medical_reports")
    patient = relationship("User", back_populates="medical_reports")


class MedicineReminder(Base):
    __tablename__ = "medicine_reminders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medicine_name = Column(String(255), nullable=False)
    dosage = Column(String(255), nullable=True)
    morning = Column(Boolean, default=False)
    afternoon = Column(Boolean, default=False)
    night = Column(Boolean, default=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="medicine_reminders")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String(50), default="general")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
