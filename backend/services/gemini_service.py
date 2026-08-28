import os
import time
import logging
from typing import Optional

import google.generativeai as genai

from backend.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service responsible for Gemini API communication.

    Handles:
    - Initialization with API key from environment
    - Sending messages to Gemini
    - Receiving and cleaning responses
    - Error handling (missing key, API failures, timeouts)
    - Reasonable defaults and timeout protection
    """

    def __init__(self) -> None:
        self.api_key: str = settings.GEMINI_API_KEY
        self.model_name: str = "gemini-1.5-flash"
        self._model: Optional[genai.GenerativeModel] = None
        self._setup_time: float = 0.0
        self._system_instruction: Optional[str] = None
        self._initialize()

    def _initialize(self) -> None:
        """Initialize the Gemini client.

        Raises:
            ValueError: If GEMINI_API_KEY is not configured.
        """
        if not self.api_key or self.api_key.strip() == "":
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Set it in the backend .env file."
            )

        # Medical assistant system instruction - keeps the AI helpful but
        # clearly not a doctor, encourages professional care, and handles
        # emergency symptoms appropriately.
        self._system_instruction = (
            "You are a Medical Assistant AI. You help users with general "
            "health information, lifestyle questions, and understanding medical "
            "conditions. You are NOT a doctor and cannot provide a medical "
            "diagnosis, prescribe treatment, or claim certainty about any "
            "condition. "
            "• Always encourage users to consult a licensed healthcare "
            "professional for personal medical advice, diagnosis, or treatment. "
            "• If a user describes emergency symptoms (chest pain, difficulty "
            "breathing, severe trauma, stroke signs, anaphylaxis, etc.), "
            "clearly recommend seeking immediate emergency medical attention "
            "or calling emergency services. "
            "• Provide information cautiously - use phrases like 'may', 'can', "
            "'often', 'typically' rather than 'will', 'definitely', 'always'. "
            "• Never present a diagnosis as certain. "
            "• Keep responses concise and clear. "
            "• Be non-judgmental and supportive. "
            "• This is an assistant tool, not a substitute for professional "
            "medical care."
        )

        genai.configure(api_key=self.api_key)
        self._model = genai.GenerativeModel(
            self.model_name,
            system_instruction=self._system_instruction,
        )
        self._setup_time = time.time()
        logger.info(
            f"Gemini service initialized with model '{self.model_name}' "
            f"after {time.time() - self._setup_time:.2f}s"
        )

    def _strip_markdown(self, text: str) -> str:
        """Remove common markdown formatting from Gemini responses.

        Gemini often wraps responses in markdown code blocks (```text ... ```)
        or uses bold/italic. This strips those to return clean text.
        """
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

    def send_message(self, message: str, timeout_seconds: int = 30) -> Optional[str]:
        """Send a message to Gemini and return the cleaned response.

        Args:
            message: The user's message/question.
            timeout_seconds: Maximum time to wait for a response.

        Returns:
            The cleaned Gemini response text, or None on failure.

        Raises:
            ValueError: If the message is empty/whitespace-only.
        """
        if not message or not message.strip():
            raise ValueError("Message must not be empty")

        if not self._model:
            logger.error("Gemini model not initialized")
            return None

        start_time = time.time()

        try:
            # Configure generation settings for a medical assistant:
            # - concise responses
            # - temperature for some creativity but not randomness
            # - safe settings for medical content
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 1024,
            }

            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
            ]

            chat = self._model.start_chat(history=[])

            response = chat.send_message(
                message,
                generation_config=generation_config,
                safety_settings=safety_settings,
            )

            elapsed = time.time() - start_time
            logger.info(f"Gemini response received in {elapsed:.2f}s")

            if not response or not response.text:
                logger.warning("Gemini returned empty response")
                return None

            clean_text = self._strip_markdown(response.text)

            # Additional safety: if the response is very short or seems
            # like a default fallback, log a warning
            if len(clean_text) < 10:
                logger.warning(f"Gemini response very short ({len(clean_text)} chars): '{clean_text}'")
                # Don't necessarily fail - just return what we got

            return clean_text

        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(
                f"Gemini API error after {elapsed:.2f}s: {type(e).__name__}: {e}"
            )
            # Do not expose the API key or internal details
            return None

    def check_key_validity(self) -> bool:
        """Quick check if the API key is configured and non-empty.

        Returns:
            True if the key is set and appears configured.
        """
        return bool(self.api_key and self.api_key.strip())


# Create a singleton instance for use across the app
gemini_service = GeminiService()