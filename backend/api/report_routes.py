import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.user import User
from backend.models.medical import MedicalReport, Prediction
from backend.schemas.medical import PredictionHistoryResponse
from backend.auth.auth_handler import get_current_user
from backend.services.report_service import generate_report

router = APIRouter()


@router.post("/reports/generate/{prediction_id}")
def create_report(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id,
    ).first()

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found",
        )

    report = generate_report(prediction_id, current_user.id, db)
    if not report:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate report",
        )
    return {"message": "Report generated successfully", "report_id": report.id}


@router.get("/reports/{report_id}")
def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id,
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    if not report.report_url or not os.path.exists(report.report_url):
        raise HTTPException(
            status_code=404,
            detail="Report file not found",
        )

    return FileResponse(
        report.report_url,
        media_type="application/pdf",
        filename=f"mediassist_report_{report_id}.pdf",
    )


@router.get("/reports", response_model=List[PredictionHistoryResponse])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.patient_id == current_user.id)
        .order_by(MedicalReport.generated_at.desc())
        .all()
    )

    result = []
    for report in reports:
        if report.prediction:
            result.append(PredictionHistoryResponse(
                id=report.id,
                symptoms=report.prediction.symptoms,
                predicted_disease=report.prediction.predicted_disease,
                confidence=report.prediction.confidence,
                was_emergency=report.prediction.was_emergency,
                created_at=report.generated_at,
            ))
    return result
