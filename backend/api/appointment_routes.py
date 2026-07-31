from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from backend.database.database import get_db
from backend.models.user import User, UserRole
from backend.models.medical import Appointment
from backend.schemas.medical import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from backend.auth.auth_handler import get_current_user

router = APIRouter()


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
        Appointment.status != "cancelled",
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
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    update_data: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
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

    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    if appointment.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this appointment",
        )

    appointment.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled successfully"}


@router.get("/appointments", response_model=List[AppointmentResponse])
def list_appointments(
    skip: int = 0,
    limit: int = 20,
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
    return appointments


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    if appointment.patient_id != current_user.id and appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment",
        )
    return appointment


@router.get("/appointments/doctor", response_model=List[AppointmentResponse])
def get_doctor_appointments(
    skip: int = 0,
    limit: int = 20,
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
    return appointments
