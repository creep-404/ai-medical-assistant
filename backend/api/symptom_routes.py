from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.medical import Symptom
from backend.schemas.medical import SymptomResponse

router = APIRouter()


@router.get("/symptoms", response_model=List[SymptomResponse])
def list_symptoms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    symptoms = db.query(Symptom).offset(skip).limit(limit).all()
    return symptoms


@router.get("/symptoms/emergency", response_model=List[SymptomResponse])
def list_emergency_symptoms(
    db: Session = Depends(get_db),
):
    symptoms = db.query(Symptom).filter(Symptom.is_emergency == True).all()
    return symptoms
