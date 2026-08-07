from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.database import get_db
from backend.models.medical import Disease, Symptom
from backend.schemas.medical import DiseaseResponse

router = APIRouter()


@router.get("/diseases", response_model=List[DiseaseResponse])
def list_diseases(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None, max_length=200),
    db: Session = Depends(get_db),
):
    query = db.query(Disease)
    if search:
        query = query.filter(Disease.name.ilike(f"%{search}%"))
    diseases = query.offset(skip).limit(limit).all()
    return diseases


@router.get("/diseases/{disease_id}", response_model=DiseaseResponse)
def get_disease(
    disease_id: int,
    db: Session = Depends(get_db),
):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease


@router.get("/diseases/symptoms", response_model=List[DiseaseResponse])
def get_diseases_by_symptoms(
    symptom_ids: List[int] = Query(...),
    db: Session = Depends(get_db),
):
    symptoms = db.query(Symptom).filter(Symptom.id.in_(symptom_ids)).all()
    if not symptoms:
        raise HTTPException(status_code=404, detail="No symptoms found")

    diseases = db.query(Disease).all()
    matched_diseases = []
    symptom_id_set = {s.id for s in symptoms}

    for disease in diseases:
        disease_symptom_ids = {s.id for s in disease.symptoms}
        if disease_symptom_ids & symptom_id_set:
            matched_diseases.append(disease)

    return matched_diseases
