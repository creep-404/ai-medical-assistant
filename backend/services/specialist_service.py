from typing import Dict, List, Optional

DISEASE_SPECIALIST_MAP = {
    "common cold": "General Physician",
    "influenza": "General Physician",
    "covid-19": "Pulmonologist",
    "migraine": "Neurologist",
    "tension headache": "Neurologist",
    "gastroenteritis": "Gastroenterologist",
    "hypertension": "Cardiologist",
    "diabetes type 2": "Endocrinologist",
    "anemia": "Hematologist",
    "urinary tract infection": "Urologist",
    "pneumonia": "Pulmonologist",
    "bronchitis": "Pulmonologist",
    "allergic rhinitis": "ENT Specialist",
    "arthritis": "Orthopedist",
    "asthma": "Pulmonologist",
    "gastritis": "Gastroenterologist",
    "food poisoning": "Gastroenterologist",
    "dengue fever": "General Physician",
    "chest pain": "Cardiologist",
    "skin rash": "Dermatologist",
    "eye problems": "Ophthalmologist",
    "fever": "General Physician",
}

SYMPTOM_SPECIALIST_MAP = {
    "fever": "General Physician",
    "cough": "Pulmonologist",
    "headache": "Neurologist",
    "chest pain": "Cardiologist",
    "skin rash": "Dermatologist",
    "rash": "Dermatologist",
    "itching": "Dermatologist",
    "joint pain": "Orthopedist",
    "blurred vision": "Ophthalmologist",
    "eye": "Ophthalmologist",
    "abdominal pain": "Gastroenterologist",
    "stomach": "Gastroenterologist",
    "frequent urination": "Urologist",
    "ear pain": "ENT Specialist",
    "shortness of breath": "Pulmonologist",
    "asthma": "Pulmonologist",
}

SPECIALIST_KEYWORDS: Dict[str, List[str]] = {
    "General Physician": ["physician", "general", "family", "doctor", "internal medicine", "primary care"],
    "Neurologist": ["neurolog", "neuro", "brain", "nerve"],
    "Dermatologist": ["dermato", "skin"],
    "Cardiologist": ["cardio", "heart"],
    "Ophthalmologist": ["ophthalmo", "eye", "vision", "optometr", "optician"],
    "Pulmonologist": ["pulmo", "respiratory", "lung", "chest"],
    "Gastroenterologist": ["gastro", "digestive", "stomach", "bowel"],
    "Endocrinologist": ["endocrin", "diabetes", "thyroid", "hormone"],
    "Orthopedist": ["ortho", "bone", "joint"],
    "ENT Specialist": ["ent", "ear", "nose", "throat"],
    "Urologist": ["urolog", "urinary", "kidney", "bladder"],
    "Hematologist": ["hemato", "blood"],
    "Pediatrician": ["pedia"],
    "Gynecologist": ["gyneco", "women", "obstetr"],
}

REASON_TEMPLATE = "Based on your predicted condition ({condition}), a {specialist} is recommended for your care."


def get_specialist_for_disease(
    disease: Optional[str] = None,
    symptoms: Optional[List[str]] = None,
) -> Dict:
    if disease:
        key = disease.strip().lower()
        if key in DISEASE_SPECIALIST_MAP:
            specialist = DISEASE_SPECIALIST_MAP[key]
            return {
                "specialist": specialist,
                "specialist_keywords": SPECIALIST_KEYWORDS.get(specialist, []),
                "reason": REASON_TEMPLATE.format(condition=disease, specialist=specialist),
            }

    if symptoms:
        for sym in symptoms:
            key = sym.strip().lower()
            if key in SYMPTOM_SPECIALIST_MAP:
                specialist = SYMPTOM_SPECIALIST_MAP[key]
                return {
                    "specialist": specialist,
                    "specialist_keywords": SPECIALIST_KEYWORDS.get(specialist, []),
                    "reason": f"Based on your symptom ({sym}), a {specialist} is recommended for your care.",
                }

    default = "General Physician"
    return {
        "specialist": default,
        "specialist_keywords": SPECIALIST_KEYWORDS.get(default, []),
        "reason": "A general physician can help assess your condition and refer you to a specialist if needed.",
    }


def match_specialty_keywords(specialty: str) -> List[str]:
    return [k.lower() for k in SPECIALIST_KEYWORDS.get(specialty, [])]
