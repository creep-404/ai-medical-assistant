from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.database.database import get_db
from backend.models.user import User
from backend.models.medical import Prediction
from backend.schemas.medical import (
    PredictionRequest,
    PredictionResponse,
    TopPrediction,
    MedicineResponse,
    PredictionHistoryResponse,
    PredictionStatsResponse,
)
from backend.auth.auth_handler import get_current_user
from backend.auth.rate_limiter import make_predict_limiter, client_ip
from backend.ml.predict import predict_disease, get_disease_details
from backend.ml.emergency_detector import check_emergency
from backend.services.specialist_service import get_specialist_for_disease

router = APIRouter()

_predict_limiter = None


def _get_predict_limiter():
    global _predict_limiter
    if _predict_limiter is None:
        _predict_limiter = make_predict_limiter()
    return _predict_limiter


def _split_text(text) -> List[str]:
    if not text:
        return None
    return [item.strip() for item in str(text).split(",") if item.strip()]


@router.post("/predict", response_model=PredictionResponse)
def predict(
    request: Request,
    prediction_request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_predict_limiter().check(client_ip(request))

    if not prediction_request.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one symptom is required",
        )

    is_emergency, emergency_message = check_emergency(prediction_request.symptoms)

    symptoms_str = ",".join(prediction_request.symptoms)

    if is_emergency:
        prediction = Prediction(
            user_id=current_user.id,
            symptoms=symptoms_str,
            predicted_disease=None,
            confidence=None,
            was_emergency=True,
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        return PredictionResponse(
            id=prediction.id,
            predicted_disease=None,
            confidence=None,
            top_predictions=[],
            is_emergency=True,
            emergency_message=emergency_message,
        )

    result = predict_disease(prediction_request.symptoms, db)

    top_predictions = []
    if result.get("top_predictions"):
        top_predictions = [
            TopPrediction(disease=item["disease"], confidence=item["confidence"])
            for item in result["top_predictions"]
        ]

    prediction = Prediction(
        user_id=current_user.id,
        symptoms=symptoms_str,
        predicted_disease=result.get("predicted_disease"),
        confidence=result.get("confidence"),
        was_emergency=False,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    details = None
    if result.get("predicted_disease"):
        details = get_disease_details(result["predicted_disease"], db)

    specialist_info = get_specialist_for_disease(
        result.get("predicted_disease"), prediction_request.symptoms
    )

    return PredictionResponse(
        id=prediction.id,
        predicted_disease=result.get("predicted_disease"),
        confidence=result.get("confidence"),
        top_predictions=top_predictions,
        is_emergency=False,
        emergency_message=None,
        description=details["description"] if details else None,
        causes=_split_text(details["causes"]) if details else None,
        home_remedies=_split_text(details["home_remedies"]) if details else None,
        diet_suggestions=_split_text(details["diet_suggestions"]) if details else None,
        hydration_advice=details["hydration_advice"] if details else None,
        recovery_time=details["recovery_time"] if details else None,
        precautions=_split_text(details["precautions"]) if details else None,
        when_to_see_doctor=details["when_to_see_doctor"] if details else None,
        medicines=(
            [MedicineResponse(**m) for m in details["medicines"]] if details else None
        ),
        recommended_specialist=specialist_info["specialist"],
    )


@router.get("/history", response_model=List[PredictionHistoryResponse])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return predictions


@router.delete("/history/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id, Prediction.user_id == current_user.id)
        .first()
    )
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found",
        )
    db.delete(prediction)
    db.commit()
    return {"message": "Prediction deleted successfully"}


@router.get("/history/stats", response_model=PredictionStatsResponse)
def get_prediction_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).all()
    total = len(predictions)
    emergency_cases = sum(1 for p in predictions if p.was_emergency)

    disease_counts = {}
    for p in predictions:
        if p.predicted_disease:
            disease_counts[p.predicted_disease] = disease_counts.get(p.predicted_disease, 0) + 1

    common_disease = max(disease_counts, key=disease_counts.get) if disease_counts else None

    return PredictionStatsResponse(
        total_predictions=total,
        emergency_cases=emergency_cases,
        common_disease=common_disease,
        disease_counts=disease_counts,
    )
