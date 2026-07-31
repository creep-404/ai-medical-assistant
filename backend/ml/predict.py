from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from backend.models.medical import Disease, Symptom, Medicine, disease_symptom_association, disease_medicine_association


def preprocess_symptoms(symptoms: List[str], db: Session) -> List[str]:
    processed = []
    symptom_records = db.query(Symptom).all()
    symptom_name_map = {s.name.lower(): s.name for s in symptom_records}

    for s in symptoms:
        s_lower = s.strip().lower()
        if s_lower in symptom_name_map:
            processed.append(symptom_name_map[s_lower])
        else:
            processed.append(s.strip())

    return processed


def predict_disease(symptoms: List[str], db: Session) -> Dict:
    processed_symptoms = preprocess_symptoms(symptoms, db)
    symptom_records = db.query(Symptom).filter(
        Symptom.name.in_(processed_symptoms)
    ).all()

    if not symptom_records:
        return {
            "predicted_disease": None,
            "confidence": 0.0,
            "top_predictions": [],
        }

    symptom_ids = {s.id for s in symptom_records}
    diseases = db.query(Disease).all()

    disease_scores = []
    for disease in diseases:
        disease_symptom_ids = {ds.id for ds in disease.symptoms}
        if not disease_symptom_ids:
            continue
        matched = len(symptom_ids & disease_symptom_ids)
        total = len(disease_symptom_ids)
        score = matched / total if total > 0 else 0
        if score > 0:
            disease_scores.append((disease, score))

    disease_scores.sort(key=lambda x: x[1], reverse=True)

    if not disease_scores:
        return {
            "predicted_disease": None,
            "confidence": 0.0,
            "top_predictions": [],
        }

    top_disease, top_score = disease_scores[0]
    total_possible = len(symptom_ids)
    confidence = top_score
    if total_possible > 0:
        overlap_ratio = len(symptom_ids & {ds.id for ds in top_disease.symptoms}) / total_possible
        confidence = (top_score + overlap_ratio) / 2

    top_predictions = [
        {"disease": d.name, "confidence": round(s, 4)}
        for d, s in disease_scores[:5]
    ]

    return {
        "predicted_disease": top_disease.name,
        "confidence": round(confidence, 4),
        "top_predictions": top_predictions,
    }


def get_disease_details(disease_name: str, db: Session) -> Optional[Dict]:
    disease = db.query(Disease).filter(Disease.name == disease_name).first()
    if not disease:
        return None

    medicines = db.query(Medicine).join(
        disease_medicine_association
    ).join(
        Disease
    ).filter(Disease.name == disease_name).all()

    return {
        "id": disease.id,
        "name": disease.name,
        "description": disease.description,
        "causes": disease.causes,
        "treatment": disease.treatment,
        "precautions": disease.precautions,
        "home_remedies": disease.home_remedies,
        "recovery_time": disease.recovery_time,
        "diet_suggestions": disease.diet_suggestions,
        "hydration_advice": disease.hydration_advice,
        "when_to_see_doctor": disease.when_to_see_doctor,
        "medicines": [
            {
                "id": m.id,
                "name": m.name,
                "medicine_type": m.medicine_type,
                "dosage": m.dosage,
                "usage_instructions": m.usage_instructions,
            }
            for m in medicines
        ],
    }
