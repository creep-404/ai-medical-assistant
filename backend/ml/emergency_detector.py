from typing import List, Tuple

EMERGENCY_SYMPTOMS = {
    "chest pain": "chest_pain",
    "difficulty breathing": "difficulty_breathing",
    "shortness of breath": "difficulty_breathing",
    "severe bleeding": "severe_bleeding",
    "stroke symptoms": "stroke_symptoms",
    "facial drooping": "stroke_symptoms",
    "arm weakness": "stroke_symptoms",
    "speech difficulty": "stroke_symptoms",
    "loss of consciousness": "loss_of_consciousness",
    "unconsciousness": "loss_of_consciousness",
    "fainting": "loss_of_consciousness",
    "seizure": "seizures",
    "convulsions": "seizures",
    "high fever above 103": "high_fever_above_103",
    "high fever": "high_fever_above_103",
    "blood in vomit": "blood_vomiting",
    "vomiting blood": "blood_vomiting",
    "pregnancy emergency": "pregnancy_emergency",
    "heart attack symptoms": "heart_attack_symptoms",
    "chest tightness": "heart_attack_symptoms",
    "severe abdominal pain": "severe_abdominal_pain",
    "persistent unconsciousness": "persistent_unconsciousness",
    "severe allergic reaction": "difficulty_breathing",
    "anaphylaxis": "difficulty_breathing",
    "choking": "difficulty_breathing",
}

EMERGENCY_MESSAGE = (
    "Your symptoms may indicate a serious medical condition. "
    "Please visit the nearest hospital or consult a licensed doctor immediately."
)


def check_emergency(symptoms: List[str]) -> Tuple[bool, str]:
    symptom_set = {s.strip().lower() for s in symptoms}
    emergency_symptom_set = {s.lower() for s in EMERGENCY_SYMPTOMS}

    matched = symptom_set & emergency_symptom_set
    if matched:
        return True, EMERGENCY_MESSAGE

    return False, ""
