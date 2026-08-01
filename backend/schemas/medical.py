from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class AppointmentStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


class SymptomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_emergency: bool = False

    class Config:
        from_attributes = True


class MedicineResponse(BaseModel):
    id: int
    name: str
    medicine_type: Optional[str] = None
    dosage: Optional[str] = None
    age_group: Optional[str] = None
    side_effects: Optional[str] = None
    food_interaction: Optional[str] = None
    usage_instructions: Optional[str] = None

    class Config:
        from_attributes = True


class DiseaseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    causes: Optional[str] = None
    treatment: Optional[str] = None
    precautions: Optional[str] = None
    home_remedies: Optional[str] = None
    recovery_time: Optional[str] = None
    diet_suggestions: Optional[str] = None
    hydration_advice: Optional[str] = None
    when_to_see_doctor: Optional[str] = None
    symptoms: Optional[List[SymptomResponse]] = None
    medicines: Optional[List["MedicineResponse"]] = None

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    symptoms: List[str]


class TopPrediction(BaseModel):
    disease: str
    confidence: float


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    predicted_disease: Optional[str] = None
    confidence: Optional[float] = None
    top_predictions: Optional[List[TopPrediction]] = None
    is_emergency: bool = False
    emergency_message: Optional[str] = None
    description: Optional[str] = None
    causes: Optional[List[str]] = None
    home_remedies: Optional[List[str]] = None
    diet_suggestions: Optional[List[str]] = None
    hydration_advice: Optional[str] = None
    recovery_time: Optional[str] = None
    precautions: Optional[List[str]] = None
    when_to_see_doctor: Optional[str] = None
    medicines: Optional[List[MedicineResponse]] = None
    recommended_specialist: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    doctor_id: int
    date: date
    time: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    clinic: Optional[str] = None


class AppointmentUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    clinic: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    date: date
    time: str
    status: AppointmentStatus
    reason: Optional[str] = None
    notes: Optional[str] = None
    clinic: Optional[str] = None
    created_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_hospital: Optional[str] = None

    class Config:
        from_attributes = True


class GeocodeRequest(BaseModel):
    city: str


class GeocodeResponse(BaseModel):
    lat: float
    lng: float
    display_name: Optional[str] = None


class NearbySearchRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 5.0
    place_type: Optional[str] = "all"
    specialty: Optional[str] = None


class NearbyPlaceResponse(BaseModel):
    name: str
    type: str
    address: Optional[str] = None
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    lat: float
    lng: float
    distance_km: float = 0.0
    is_registered: bool = False
    doctor_id: Optional[int] = None
    specialty: Optional[str] = None
    hospital: Optional[str] = None


class SpecialistResponse(BaseModel):
    specialist: str
    specialist_keywords: List[str] = []
    reason: Optional[str] = None


class AppointmentStatsResponse(BaseModel):
    total: int = 0
    pending: int = 0
    confirmed: int = 0
    rejected: int = 0
    completed: int = 0
    cancelled: int = 0
    upcoming: int = 0
    per_doctor: Optional[dict] = None


class MedicineReminderCreate(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class MedicineReminderResponse(BaseModel):
    id: int
    user_id: int
    medicine_name: str
    dosage: Optional[str] = None
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class PredictionHistoryResponse(BaseModel):
    id: int
    symptoms: str
    predicted_disease: Optional[str] = None
    confidence: Optional[float] = None
    was_emergency: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionStatsResponse(BaseModel):
    total_predictions: int
    emergency_cases: int
    common_disease: Optional[str] = None
    disease_counts: Optional[dict] = None
