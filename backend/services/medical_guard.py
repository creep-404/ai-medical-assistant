import re
from typing import Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum


class TopicCategory(Enum):
    """Categories of topics that Medi AI can handle."""
    MEDICAL_CONDITION = "medical_condition"
    SYMPTOMS = "symptoms"
    MEDICINES = "medicines"
    TREATMENT = "treatment"
    PREVENTION = "prevention"
    DIET_NUTRITION = "diet_nutrition"
    LIFESTYLE = "lifestyle"
    APPOINTMENTS = "appointments"
    MEDICAL_REPORTS = "medical_reports"
    HEALTH_METRICS = "health_metrics"
    EMERGENCY = "emergency"
    MEDIASSIST_FEATURES = "mediassist_features"
    GENERAL_HEALTH = "general_health"


class GuardDecision(Enum):
    """Decision from the medical guard."""
    ALLOW = "allow"
    BLOCK = "block"
    REDIRECT = "redirect"  # Allow but redirect to safer topic


@dataclass
class GuardResult:
    """Result of the medical topic guard check."""
    decision: GuardDecision
    category: Optional[TopicCategory] = None
    reason: str = ""
    suggested_response: Optional[str] = None


class MedicalTopicGuard:
    """Medical topic guard to ensure Medi AI stays on healthcare topics.

    This guard validates whether a user's request is related to healthcare,
    MediAssist features, or general health education. It blocks clearly
    unrelated requests (programming, math, entertainment, politics, etc.)
    while allowing legitimate medical questions.
    """

    # Keywords that indicate medical/health topics
    MEDICAL_KEYWORDS = {
        TopicCategory.MEDICAL_CONDITION: [
            "disease", "condition", "illness", "disorder", "syndrome", "infection",
            "cancer", "diabetes", "hypertension", "asthma", "arthritis", "migraine",
            "flu", "cold", "covid", "pneumonia", "bronchitis", "ulcer", "allergy",
            "anemia", "depression", "anxiety", "insomnia", "obesity", "thyroid",
        ],
        TopicCategory.SYMPTOMS: [
            "symptom", "pain", "ache", "fever", "cough", "nausea", "vomiting",
            "headache", "dizziness", "fatigue", "shortness of breath", "rash",
            "swelling", "bleeding", "numbness", "tingling", "weakness", "fainting",
            "chest pain", "abdominal pain", "back pain", "joint pain", "sore throat",
            "runny nose", "congestion", "wheezing", "palpitations", "insomnia",
        ],
        TopicCategory.MEDICINES: [
            "medicine", "medication", "drug", "pill", "tablet", "capsule", "syrup",
            "injection", "dosage", "dose", "prescription", "otc", "over the counter",
            "antibiotic", "painkiller", "analgesic", "antihistamine", "steroid",
            "insulin", "metformin", "ibuprofen", "paracetamol", "aspirin",
            "side effect", "interaction", "contraindication", "allergy",
        ],
        TopicCategory.TREATMENT: [
            "treatment", "therapy", "cure", "heal", "recovery", "rehabilitation",
            "surgery", "operation", "procedure", "hospitalization", "physiotherapy",
            "counseling", "psychotherapy", "chemotherapy", "radiation", "dialysis",
            "transplant", "remission", "palliative", "hospice",
        ],
        TopicCategory.PREVENTION: [
            "prevention", "prevent", "vaccine", "vaccination", "immunization",
            "screening", "checkup", "check-up", "early detection", "risk factor",
            "healthy lifestyle", "hygiene", "sanitation", "prophylaxis",
        ],
        TopicCategory.DIET_NUTRITION: [
            "diet", "nutrition", "food", "eat", "eating", "meal", "calorie",
            "vitamin", "mineral", "supplement", "protein", "carbohydrate", "fat",
            "fiber", "hydration", "water", "dehydration", "malnutrition", "obesity",
            "weight loss", "weight gain", "bmi", "metabolism", "deficiency",
        ],
        TopicCategory.LIFESTYLE: [
            "exercise", "workout", "physical activity", "fitness", "sleep", "stress",
            "mental health", "wellness", "wellbeing", "mindfulness", "meditation",
            "yoga", "smoking", "alcohol", "substance", "addiction", "sedentary",
        ],
        TopicCategory.APPOINTMENTS: [
            "appointment", "booking", "schedule", "doctor", "physician", "specialist",
            "clinic", "hospital", "consultation", "visit", "checkup", "follow-up",
            "referral", "prescription", "refill", "insurance", "copay",
        ],
        TopicCategory.MEDICAL_REPORTS: [
            "report", "lab result", "test result", "blood work", "x-ray", "mri",
            "ct scan", "ultrasound", "biopsy", "pathology", "radiology", "diagnosis",
            "medical record", "health record", "summary", "findings",
        ],
        TopicCategory.HEALTH_METRICS: [
            "blood pressure", "heart rate", "pulse", "temperature", "bmi", "glucose",
            "cholesterol", "a1c", "hemoglobin", "oxygen saturation", "spo2",
            "respiratory rate", "vitals", "vital signs",
        ],
        TopicCategory.EMERGENCY: [
            "emergency", "urgent", "911", "ambulance", "er", "emergency room",
            "heart attack", "stroke", "seizure", "choking", "anaphylaxis",
            "severe bleeding", "unconscious", "overdose", "poisoning", "trauma",
            "burn", "fracture", "head injury", "spinal injury",
        ],
        TopicCategory.MEDIASSIST_FEATURES: [
            "mediassist", "medi assist", "symptom checker", "prediction", "predict",
            "diagnosis", "diagnose", "specialist", "nearby doctor", "nearby hospital",
            "nearby clinic", "book appointment", "medical report", "medicine reminder",
            "health dashboard", "bmi calculator", "water intake", "report generation",
        ],
        TopicCategory.GENERAL_HEALTH: [
            "health", "healthy", "wellness", "wellbeing", "medical", "healthcare",
            "patient", "care", "treatment", "therapy", "medicine", "doctor",
            "hospital", "clinic", "pharmacy", "pharmacist", "nurse", "provider",
        ],
    }

    # Keywords that clearly indicate NON-medical topics (should be blocked)
    NON_MEDICAL_KEYWORDS = [
        # Programming/tech
        "code", "programming", "python", "javascript", "java", "c++", "html", "css",
        "sql", "database", "api", "framework", "library", "function", "variable",
        "algorithm", "debug", "git", "github", "docker", "kubernetes", "aws", "cloud",
        "server", "backend", "frontend", "fullstack", "devops", "ci/cd", "pipeline",
        "regex", "recursion", "binary tree", "linked list", "hashmap", "api key",
        "environment variable", "configuration", "deployment", "microservice",

        # Mathematics
        "calculate", "equation", "formula", "derivative", "integral", "matrix",
        "vector", "probability", "statistics", "theorem", "proof", "geometry",
        "algebra", "calculus", "trigonometry", "logarithm", "exponent", "polynomial",

        # Entertainment/gaming
        "game", "gaming", "play", "video game", "xbox", "playstation", "nintendo",
        "steam", "twitch", "streamer", "youtuber", "movie", "film", "cinema",
        "actor", "actress", "director", "netflix", "disney", "marvel", "dc comics",
        "anime", "manga", "novel", "book", "fiction", "fantasy", "sci-fi",

        # Politics/social issues
        "politics", "politician", "government", "election", "vote", "policy", "law",
        "congress", "parliament", "president", "prime minister", "democracy",
        "republican", "democrat", "liberal", "conservative", "activism", "protest",

        # Personal/private
        "password", "credit card", "ssn", "social security", "bank account", "pin",
        "private key", "secret", "confidential", "personal information",

        # Inappropriate
        "adult", "porn", "sex", "sexual", "drug abuse", "illegal", "weapon",
        "violence", "harm", "suicide", "self-harm", "eating disorder",
    ]

    # Patterns for common non-medical question types
    NON_MEDICAL_PATTERNS = [
        r"^how (to|do i) (code|program|write|create|build|make|install|configure|deploy|run|debug)",
        r"^what is the (code|syntax|command|command line|terminal|cli) for",
        r"^(write|generate|create) (a |an |the )?(function|class|script|program|code|query)",
        r"^(explain|describe) (the |this )?(code|algorithm|function|regex|sql|query)",
        r"^(solve|calculate|compute|find) (the |this )?(equation|derivative|integral|math|problem)",
        r"^(who|what|when|where|why) (is|was|were|are) (the )?(president|prime minister|ceo|founder|director|actor|actress|singer|player|team|country|capital|population)",
        r"^(recommend|suggest) (a |some )?(movie|film|game|book|novel|show|series|restaurant|place|hotel|vacation|travel)",
        r"^(translate|convert) (this|that|it) (to|into|from) (english|spanish|french|german|chinese|japanese|korean|russian|arabic)",
        r"^(what|which) (is|are) (the )?(best|top|good|popular) (game|movie|book|phone|laptop|car|brand|framework|library|tool)",
        # SQL and database specific patterns
        r"\b(write|run|execute)\s+.*\b(sql|query)\b",
        r"\b(sql|select|insert|update|delete|create table|alter|drop)\b.*\b(from|where|join|table)\b",
    ]

    def __init__(self):
        # Compile regex patterns for performance
        self._non_medical_regex = [re.compile(p, re.IGNORECASE) for p in self.NON_MEDICAL_PATTERNS]
        # Build keyword sets for faster lookup
        self._medical_keywords = set()
        for keywords in self.MEDICAL_KEYWORDS.values():
            self._medical_keywords.update(keywords)
        self._non_medical_set = set(self.NON_MEDICAL_KEYWORDS)

    def check(self, message: str, context: Optional[dict] = None) -> GuardResult:
        """Check if a message is appropriate for Medi AI.

        Args:
            message: The user's message to check.
            context: Optional context (e.g., prediction data, user info).

        Returns:
            GuardResult with the decision and any suggested response.
        """
        if not message or not message.strip():
            return GuardResult(
                decision=GuardDecision.BLOCK,
                reason="Empty message",
                suggested_response="Please ask a question or describe your concern."
            )

        text = message.strip().lower()

        # Check for non-medical patterns first (high confidence blocks)
        for pattern in self._non_medical_regex:
            if pattern.search(text):
                return GuardResult(
                    decision=GuardDecision.BLOCK,
                    reason="Non-medical topic detected (programming, math, entertainment, etc.)",
                    suggested_response=(
                        "I'm Medi AI, a medical assistant focused on health-related topics. "
                        "I can't help with programming, mathematics, entertainment, or general knowledge questions. "
                        "Please ask me about symptoms, conditions, medicines, treatments, diet, "
                        "appointments, or other health-related topics."
                    )
                )

        # Check for explicit non-medical keywords (strong signal)
        non_medical_found = [kw for kw in self._non_medical_set if kw in text]
        if non_medical_found:
            # Allow if medical keywords also present (mixed context)
            medical_found = [kw for kw in self._medical_keywords if kw in text]
            if not medical_found or len(non_medical_found) > len(medical_found) * 2:
                return GuardResult(
                    decision=GuardDecision.BLOCK,
                    reason=f"Non-medical keywords detected: {', '.join(non_medical_found[:5])}",
                    suggested_response=(
                        "I'm Medi AI, designed to help with health and medical topics. "
                        "I can't assist with that type of request. "
                        "Please ask me about symptoms, conditions, medicines, diet, appointments, "
                        "or other health-related questions."
                    )
                )

        # Check for medical keywords (positive signal)
        medical_found = [kw for kw in self._medical_keywords if kw in text]
        if medical_found:
            # Determine the most relevant category
            category = self._categorize(medical_found, text)
            return GuardResult(
                decision=GuardDecision.ALLOW,
                category=category,
                reason=f"Medical keywords detected: {', '.join(medical_found[:5])}"
            )

        # If we have context (e.g., prediction data), be more permissive
        if context and context.get("prediction"):
            # Allow follow-up questions when there's active prediction context
            return GuardResult(
                decision=GuardDecision.ALLOW,
                category=TopicCategory.GENERAL_HEALTH,
                reason="Active prediction context allows follow-up questions"
            )

        # Check for MediAssist feature keywords
        feature_keywords = self.MEDICAL_KEYWORDS.get(TopicCategory.MEDIASSIST_FEATURES, [])
        if any(kw in text for kw in feature_keywords):
            return GuardResult(
                decision=GuardDecision.ALLOW,
                category=TopicCategory.MEDIASSIST_FEATURES,
                reason="MediAssist feature keywords detected"
            )

        # Short greetings and common conversational phrases - allow but redirect
        greeting_patterns = [
            r"^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b",
            r"^(thanks|thank you|thx|ty)\b",
            r"^(ok|okay|sure|alright|got it|understood)\b",
            r"^(bye|goodbye|see you|farewell)\b",
        ]
        for pattern in greeting_patterns:
            if re.search(pattern, text):
                return GuardResult(
                    decision=GuardDecision.ALLOW,
                    category=TopicCategory.GENERAL_HEALTH,
                    reason="Conversational greeting/acknowledgment"
                )

        # If we can't determine, allow but with a gentle reminder
        # (Better to allow and let LLM system prompt handle it than over-block)
        return GuardResult(
            decision=GuardDecision.ALLOW,
            category=TopicCategory.GENERAL_HEALTH,
            reason="No clear medical/non-medical signals; allowing with LLM safety layer",
            suggested_response=None
        )

    def _categorize(self, medical_keywords: List[str], text: str) -> TopicCategory:
        """Determine the most relevant medical category based on keywords."""
        # Score each category
        scores = {}
        for category, keywords in self.MEDICAL_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[category] = score

        if scores:
            return max(scores, key=scores.get)
        return TopicCategory.GENERAL_HEALTH


# Singleton instance
medical_guard = MedicalTopicGuard()


def check_medical_topic(message: str, context: Optional[dict] = None) -> GuardResult:
    """Convenience function to check a message against the medical guard."""
    return medical_guard.check(message, context)