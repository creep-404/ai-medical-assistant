import os
import time
import logging
from typing import Optional, Dict, Any

import httpx

from backend.config import settings

logger = logging.getLogger(__name__)


class OllamaService:
    """Service responsible for local Ollama LLM communication.

    Handles:
    - Connection to local Ollama server
    - Sending messages to the configured model
    - Receiving and cleaning responses
    - Error handling (connection failures, timeouts, model not found)
    - Reasonable defaults and timeout protection
    """

    def __init__(self) -> None:
        self.base_url: str = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
        self.model_name: str = getattr(settings, "OLLAMA_MODEL", "hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M")
        self._setup_time: float = 0.0
        self._system_instruction: Optional[str] = None
        self._initialize()

    def _initialize(self) -> None:
        """Initialize the Ollama client and verify connection."""
        self._system_instruction = (
            "You are Medi AI, a medical assistant integrated into the MediAssist healthcare application. "
            "Your role is to help users understand their health information, explain medical concepts, "
            "and provide general health education. You are NOT a doctor and cannot provide medical diagnosis, "
            "prescribe treatment, or replace professional medical advice. "
            "• Always encourage users to consult a licensed healthcare professional for personal medical advice, "
            "diagnosis, or treatment. "
            "• If a user describes emergency symptoms (chest pain, difficulty breathing, severe trauma, "
            "stroke signs, anaphylaxis, etc.), clearly recommend seeking immediate emergency medical "
            "attention or calling emergency services. "
            "• Provide information cautiously - use phrases like 'may', 'can', 'often', 'typically' "
            "rather than 'will', 'definitely', 'always'. "
            "• Never present a diagnosis as certain. "
            "• Keep responses concise, clear, and helpful. "
            "• Be non-judgmental, supportive, and professional. "
            "• When given a prediction context from MediAssist, use it to provide relevant explanations "
            "about the predicted condition, recommended specialists, medicines, home remedies, diet, "
            "precautions, and when to see a doctor. "
            "• This is an assistant tool, not a substitute for professional medical care."
        )
        self._setup_time = time.time()
        logger.info(f"Ollama service initialized with model '{self.model_name}' at {self.base_url}")

    async def check_health(self) -> bool:
        """Check if Ollama server is reachable and model is available."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    return self.model_name in models
                return False
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return False

    def _strip_markdown(self, text: str) -> str:
        """Remove common markdown formatting from LLM responses."""
        if not text:
            return text

        text = text.strip()

        # Remove triple-backtick code blocks (with or without language specifier)
        while text.startswith("```") and text.endswith("```"):
            text = text[3:].rstrip("\n")
            if text.endswith("```"):
                text = text[:-3].strip()

        # Remove leading/trailing asterisks for bold/italic that may remain
        text = text.strip(" *")

        return text

    async def send_message(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        timeout_seconds: int = 60,
    ) -> Optional[str]:
        """Send a message to Ollama and return the cleaned response.

        Args:
            message: The user's message/question.
            context: Optional context including prediction data, user info, etc.
            timeout_seconds: Maximum time to wait for a response.

        Returns:
            The cleaned Ollama response text, or None on failure.
        """
        if not message or not message.strip():
            raise ValueError("Message must not be empty")

        # Build the full prompt with context
        full_prompt = self._build_prompt(message, context)

        start_time = time.time()

        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                payload = {
                    "model": self.model_name,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "top_k": 40,
                        "num_predict": 1024,
                    },
                }

                logger.info(f"Sending message to Ollama model '{self.model_name}'")
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=timeout_seconds,
                )

                elapsed = time.time() - start_time
                logger.info(f"Ollama response received in {elapsed:.2f}s")

                if response.status_code != 200:
                    logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                    return None

                data = response.json()
                response_text = data.get("response", "")

                if not response_text:
                    logger.warning("Ollama returned empty response")
                    return None

                clean_text = self._strip_markdown(response_text)

                if len(clean_text) < 10:
                    logger.warning(f"Ollama response very short ({len(clean_text)} chars): '{clean_text}'")

                return clean_text

        except httpx.TimeoutException:
            elapsed = time.time() - start_time
            logger.error(f"Ollama request timed out after {elapsed:.2f}s")
            return None
        except httpx.ConnectError:
            logger.error(f"Cannot connect to Ollama at {self.base_url}. Is Ollama running?")
            return None
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"Ollama API error after {elapsed:.2f}s: {type(e).__name__}: {e}")
            return None

    def _build_prompt(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Build the full prompt with system instruction and context."""
        parts = [self._system_instruction or ""]

        # Add context if provided
        if context:
            if context.get("prediction"):
                pred = context["prediction"]
                parts.append(f"\n--- CURRENT PREDICTION CONTEXT ---")
                parts.append(f"Predicted Condition: {pred.get('disease', 'Unknown')}")
                parts.append(f"Confidence: {pred.get('confidence', 0)}%")
                if pred.get("specialist"):
                    parts.append(f"Recommended Specialist: {pred['specialist']}")
                if pred.get("medicines"):
                    meds = ", ".join([m.get("name", "") for m in pred["medicines"] if m.get("name")])
                    parts.append(f"Recommended Medicines: {meds}")
                if pred.get("home_remedies"):
                    parts.append(f"Home Remedies: {', '.join(pred['home_remedies'])}")
                if pred.get("precautions"):
                    parts.append(f"Precautions: {', '.join(pred['precautions'])}")
                if pred.get("diet_suggestions"):
                    parts.append(f"Diet Suggestions: {pred['diet_suggestions']}")
                if pred.get("when_to_see_doctor"):
                    parts.append(f"When to See Doctor: {pred['when_to_see_doctor']}")
                parts.append(f"--- END CONTEXT ---\n")

            if context.get("user"):
                user = context["user"]
                parts.append(f"\n--- USER CONTEXT ---")
                parts.append(f"User: {user.get('full_name', 'Patient')}")
                if user.get("recent_diagnoses"):
                    parts.append(f"Recent diagnoses: {', '.join(user['recent_diagnoses'])}")
                parts.append(f"--- END USER CONTEXT ---\n")

        parts.append(f"\nUser: {message.strip()}\n\nMedi AI:")

        return "\n".join(parts)

    def check_model_available(self) -> bool:
        """Quick check if the model appears to be configured."""
        return bool(self.model_name and self.model_name.strip())


# Create a singleton instance for use across the app
ollama_service = OllamaService()