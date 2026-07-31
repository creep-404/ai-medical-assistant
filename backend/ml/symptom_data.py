import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

SYMPTOMS = [
    "fever", "headache", "sneezing", "cough", "body_pain", "runny_nose",
    "fatigue", "nausea", "vomiting", "stomach_pain", "sore_throat", "chills",
    "joint_pain", "watery_eyes", "sinus_pressure", "congestion", "loss_of_appetite",
    "heartburn", "bloating", "constipation", "diarrhea", "dehydration",
    "dizziness", "skin_rash", "itching", "muscle_cramps", "sensitivity_to_light",
    "nasal_congestion", "phlegm", "swollen_glands"
]

NUM_SYMPTOMS = len(SYMPTOMS)

DISEASE_PROFILES: Dict[str, Dict[str, float]] = {
    "Common Cold": {
        "sneezing": 0.85, "runny_nose": 0.90, "congestion": 0.80, "sore_throat": 0.70,
        "cough": 0.65, "sneezing": 0.85, "fatigue": 0.50, "headache": 0.40,
        "nasal_congestion": 0.85, "watery_eyes": 0.30
    },
    "Flu": {
        "fever": 0.90, "body_pain": 0.85, "fatigue": 0.88, "chills": 0.75,
        "cough": 0.70, "headache": 0.75, "sore_throat": 0.55, "runny_nose": 0.50,
        "joint_pain": 0.70, "loss_of_appetite": 0.65, "congestion": 0.50,
        "nasal_congestion": 0.50
    },
    "Seasonal Allergy": {
        "sneezing": 0.90, "runny_nose": 0.85, "watery_eyes": 0.80, "itching": 0.70,
        "congestion": 0.65, "nasal_congestion": 0.65, "cough": 0.40,
        "sore_throat": 0.35, "headache": 0.35, "fatigue": 0.30
    },
    "Migraine": {
        "headache": 0.98, "sensitivity_to_light": 0.80, "nausea": 0.70,
        "vomiting": 0.45, "dizziness": 0.55, "fatigue": 0.50,
        "loss_of_appetite": 0.40
    },
    "Sinusitis": {
        "sinus_pressure": 0.90, "congestion": 0.85, "headache": 0.80,
        "nasal_congestion": 0.85, "fever": 0.40, "cough": 0.50,
        "fatigue": 0.55, "facial_pain": 0.75, "runny_nose": 0.60,
        "sore_throat": 0.45, "phlegm": 0.50
    },
    "Mild Fever": {
        "fever": 0.95, "body_pain": 0.55, "fatigue": 0.50, "chills": 0.45,
        "headache": 0.50, "loss_of_appetite": 0.40
    },
    "Acidity": {
        "heartburn": 0.90, "bloating": 0.75, "nausea": 0.45, "stomach_pain": 0.50,
        "loss_of_appetite": 0.35, "vomiting": 0.20
    },
    "Gastritis": {
        "stomach_pain": 0.88, "nausea": 0.75, "vomiting": 0.50,
        "loss_of_appetite": 0.65, "bloating": 0.55, "heartburn": 0.50,
        "fatigue": 0.35
    },
    "Constipation": {
        "constipation": 0.95, "bloating": 0.70, "stomach_pain": 0.55,
        "loss_of_appetite": 0.40, "nausea": 0.25
    },
    "Mild Diarrhea": {
        "diarrhea": 0.95, "stomach_pain": 0.60, "nausea": 0.50,
        "dehydration": 0.40, "fatigue": 0.35, "loss_of_appetite": 0.35,
        "vomiting": 0.25
    },
    "Food Poisoning": {
        "nausea": 0.90, "vomiting": 0.80, "stomach_pain": 0.85, "diarrhea": 0.75,
        "fever": 0.40, "dehydration": 0.55, "fatigue": 0.50, "chills": 0.35,
        "loss_of_appetite": 0.70
    },
    "Mild Dehydration": {
        "dehydration": 0.90, "dizziness": 0.65, "fatigue": 0.60, "headache": 0.50,
        "dry_mouth": 0.85, "muscle_cramps": 0.40, "dark_urine": 0.80
    },
    "Vitamin Deficiency": {
        "fatigue": 0.85, "dizziness": 0.45, "muscle_cramps": 0.40,
        "loss_of_appetite": 0.45, "skin_rash": 0.25, "headache": 0.35,
        "pale_skin": 0.50, "brittle_nails": 0.35
    },
    "Sore Throat": {
        "sore_throat": 0.95, "cough": 0.50, "swollen_glands": 0.55,
        "fever": 0.30, "runny_nose": 0.35, "congestion": 0.30,
        "nasal_congestion": 0.30
    },
    "Cough": {
        "cough": 0.95, "phlegm": 0.60, "sore_throat": 0.50, "congestion": 0.45,
        "nasal_congestion": 0.40, "fatigue": 0.30, "runny_nose": 0.35
    },
    "Minor Skin Allergy": {
        "skin_rash": 0.90, "itching": 0.85, "redness": 0.75,
        "dry_skin": 0.45, "swelling": 0.30
    },
    "Muscle Pain": {
        "body_pain": 0.90, "muscle_cramps": 0.70, "fatigue": 0.40,
        "joint_pain": 0.35, "headache": 0.25
    },
    "Tension Headache": {
        "headache": 0.95, "fatigue": 0.45, "neck_pain": 0.55,
        "sensitivity_to_light": 0.25, "dizziness": 0.20
    }
}

DISEASE_NAMES = sorted(DISEASE_PROFILES.keys())
NUM_DISEASES = len(DISEASE_NAMES)
SAMPLES_PER_DISEASE = 2000 // NUM_DISEASES

BASE_NOISE = 0.05
SYMPTOM_NOISE = 0.08


def _clamp_prob(p: float) -> float:
    return max(0.0, min(1.0, p))


def generate_sample(profile: Dict[str, float], rng: np.random.Generator) -> np.ndarray:
    features = np.zeros(NUM_SYMPTOMS, dtype=np.float64)
    for i, symptom in enumerate(SYMPTOMS):
        prob = profile.get(symptom, 0.0)
        prob = _clamp_prob(prob + rng.uniform(-BASE_NOISE, BASE_NOISE))
        if rng.uniform() < prob:
            features[i] = 1
        else:
            if rng.uniform() < SYMPTOM_NOISE:
                features[i] = 1
    return features


def generate_dataset(seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    all_rows: List[np.ndarray] = []
    all_labels: List[str] = []

    for disease in DISEASE_NAMES:
        profile = DISEASE_PROFILES[disease]
        for _ in range(SAMPLES_PER_DISEASE):
            features = generate_sample(profile, rng)
            all_rows.append(features)
            all_labels.append(disease)

    remaining = 2000 - len(all_rows)
    for _ in range(remaining):
        disease = rng.choice(DISEASE_NAMES)
        profile = DISEASE_PROFILES[disease]
        features = generate_sample(profile, rng)
        all_rows.append(features)
        all_labels.append(disease)

    df = pd.DataFrame(all_rows, columns=SYMPTOMS)
    df["disease"] = all_labels
    return df


def get_symptom_indices(symptom_names: List[str]) -> List[int]:
    indices = []
    for name in symptom_names:
        if name in SYMPTOMS:
            indices.append(SYMPTOMS.index(name))
    return indices


def symptoms_to_vector(symptom_names: List[str]) -> np.ndarray:
    vec = np.zeros(NUM_SYMPTOMS, dtype=np.float64)
    for name in symptom_names:
        if name in SYMPTOMS:
            vec[SYMPTOMS.index(name)] = 1.0
    return vec


if __name__ == "__main__":
    df = generate_dataset()
    print(f"Generated dataset with {len(df)} samples and {len(df.columns) - 1} features")
    print(f"Disease distribution:\n{df['disease'].value_counts()}")
    df.to_csv("symptom_data.csv", index=False)
    print("Saved to symptom_data.csv")
