from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.models.user import User, UserRole
from backend.models.medical import Appointment
from backend.schemas.medical import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatsResponse,
    AppointmentUpdate,
)
from backend.auth.auth_handler import get_current_user

router = APIRouter()

ACTIVE_STATUSES = ["pending", "confirmed"]


def _serialize_appointment(appointment: Appointment, db: Session) -> dict:
    patient = db.query(User).filter(User.id == appointment.patient_id).first()
    doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
    specialty = None
    hospital = None
    if doctor:
        from backend.models.user import DoctorProfile

        profile = (
            db.query(DoctorProfile)
            .filter(DoctorProfile.user_id == doctor.id)
            .first()
        )
        if profile:
            specialty = profile.specialty
            hospital = profile.hospital_name
    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "date": appointment.date,
        "time": appointment.time,
        "status": appointment.status,
        "reason": appointment.reason,
        "notes": appointment.notes,
        "clinic": appointment.clinic,
        "created_at": appointment.created_at,
        "patient_name": patient.full_name if patient else None,
        "doctor_name": doctor.full_name if doctor else None,
        "doctor_specialty": specialty,
        "doctor_hospital": hospital,
    }


def _get_appointment(appointment_id: int, db: Session) -> Appointment:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    return appointment


@router.post("/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doctor = db.query(User).filter(
        User.id == appointment_data.doctor_id,
        User.role == UserRole.doctor,
        User.is_active == True,
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    existing = db.query(Appointment).filter(
        Appointment.doctor_id == appointment_data.doctor_id,
        Appointment.date == appointment_data.date,
        Appointment.time == appointment_data.time,
        Appointment.status.in_(ACTIVE_STATUSES),
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked",
        )

    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=appointment_data.doctor_id,
        date=appointment_data.date,
        time=appointment_data.time,
        reason=appointment_data.reason,
        notes=appointment_data.notes,
        clinic=appointment_data.clinic,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return _serialize_appointment(appointment, db)


@router.get("/appointments", response_model=List[AppointmentResponse])
def list_appointments(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == current_user.id)
        .order_by(Appointment.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_serialize_appointment(a, db) for a in appointments]


@router.get("/appointments/doctor", response_model=List[AppointmentResponse])
def get_doctor_appointments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.doctor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access their appointments",
        )

    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == current_user.id)
        .order_by(Appointment.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_serialize_appointment(a, db) for a in appointments]


@router.get("/appointments/all", response_model=List[AppointmentResponse])
def get_all_appointments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all appointments",
        )
    appointments = (
        db.query(Appointment)
        .order_by(Appointment.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_serialize_appointment(a, db) for a in appointments]


@router.get("/appointments/stats", response_model=AppointmentStatsResponse)
def get_appointment_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view appointment stats",
        )

    appointments = db.query(Appointment).all()

    today = date.today()
    stats = {
        "total": len(appointments),
        "pending": 0,
        "confirmed": 0,
        "rejected": 0,
        "completed": 0,
        "cancelled": 0,
        "upcoming": 0,
        "per_doctor": {},
    }

    for a in appointments:
        status_key = a.status.value if hasattr(a.status, "value") else str(a.status)
        if status_key in stats:
            stats[status_key] += 1
        if a.date >= today and status_key in ACTIVE_STATUSES:
            stats["upcoming"] += 1

        doctor = db.query(User).filter(User.id == a.doctor_id).first()
        doctor_name = doctor.full_name if doctor else f"Doctor #{a.doctor_id}"
        stats["per_doctor"][doctor_name] = stats["per_doctor"].get(doctor_name, 0) + 1

    return AppointmentStatsResponse(**stats)


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = _get_appointment(appointment_id, db)
    if appointment.patient_id != current_user.id and appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment",
        )
    return _serialize_appointment(appointment, db)


@router.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    update_data: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = _get_appointment(appointment_id, db)
    if appointment.patient_id != current_user.id and appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this appointment",
        )

    if update_data.date is not None:
        appointment.date = update_data.date
    if update_data.time is not None:
        appointment.time = update_data.time
    if update_data.reason is not None:
        appointment.reason = update_data.reason
    if update_data.status is not None:
        appointment.status = update_data.status
    if update_data.notes is not None:
        appointment.notes = update_data.notes
    if update_data.clinic is not None:
        appointment.clinic = update_data.clinic

    db.commit()
    db.refresh(appointment)
    return _serialize_appointment(appointment, db)


@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = _get_appointment(appointment_id, db)
    if appointment.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this appointment",
        )

    appointment.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled successfully"}


@router.post("/appointments/{appointment_id}/accept", response_model=AppointmentResponse)
def accept_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.doctor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can accept appointments",
        )
    appointment = _get_appointment(appointment_id, db)
    if appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this appointment",
        )
    appointment.status = "confirmed"
    db.commit()
    db.refresh(appointment)
    return _serialize_appointment(appointment, db)


@router.post("/appointments/{appointment_id}/reject", response_model=AppointmentResponse)
def reject_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.doctor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can reject appointments",
        )
    appointment = _get_appointment(appointment_id, db)
    if appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this appointment",
        )
    appointment.status = "rejected"
    db.commit()
    db.refresh(appointment)
    return _serialize_appointment(appointment, db)


@router.post("/appointments/{appointment_id}/complete", response_model=AppointmentResponse)
def complete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.doctor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can complete appointments",
        )
    appointment = _get_appointment(appointment_id, db)
    if appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this appointment",
        )
    appointment.status = "completed"
    db.commit()
    db.refresh(appointment)
    return _serialize_appointment(appointment, db)
