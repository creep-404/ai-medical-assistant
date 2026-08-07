from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.medical import Medicine, Disease
from backend.schemas.medical import MedicineResponse

router = APIRouter()


@router.get("/medicines", response_model=List[MedicineResponse])
def list_medicines(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    medicines = db.query(Medicine).offset(skip).limit(limit).all()
    return medicines


@router.get("/medicines/{medicine_id}", response_model=MedicineResponse)
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine


@router.get("/medicines/disease/{disease_id}", response_model=List[MedicineResponse])
def get_medicines_by_disease(
    disease_id: int,
    db: Session = Depends(get_db),
):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease.medicines
