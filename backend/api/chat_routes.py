"""Chat endpoint for the Medi AI assistant (local Ollama).

Provides a POST endpoint at /api/chat that:
- Accepts a user message with optional context
- Validates topic through medical guard
- Forwards allowed messages to local Ollama (Qwen3.8-2B)
- Returns the generated response
- Handles errors gracefully
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from backend.auth.auth_handler import get_current_user
from backend.models.user import User
from backend.services.ollama_service import ollama_service
from backend.services.medical_guard import medical_guard, GuardDecision, GuardResult

import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat"])


class ChatMessage(BaseModel):
    """Request body for the chat endpoint."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User message to send to Medi AI",
    )
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional context (prediction data, user info, etc.)",
    )


class ChatResponse(BaseModel):
    """Response body from the chat endpoint."""

    response: str
    guard_decision: Optional[str] = None
    guard_category: Optional[str] = None


def _format_guard_response(guard_result: GuardResult) -> str:
    """Format a guard rejection response for the user."""
    if guard_result.suggested_response:
        return guard_result.suggested_response

    category_map = {
        "programming": "programming, coding, or software development",
        "mathematics": "mathematics, calculations, or formulas",
        "entertainment": "movies, games, books, or entertainment",
        "politics": "politics, government, or social issues",
        "personal": "personal information, passwords, or private data",
    }

    topic = "that topic"
    for key, desc in category_map.items():
        if key in guard_result.reason.lower():
            topic = desc
            break

    return (
        f"I'm Medi AI, a medical assistant designed to help with health-related topics. "
        f"I'm not able to assist with {topic}. "
        f"Please ask me about symptoms, conditions, medicines, treatments, diet, "
        f"appointments, or other health-related questions. I'm here to help with "
        f"your MediAssist experience and general health education."
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """Send a message to the Medi AI assistant.

    The local Ollama model (Qwen3.8-2B Q5_K_M) is used via the local Ollama server.
    A medical topic guard validates the request before sending to the model.

    Args:
        message: The user's message, with optional context.
        current_user: The authenticated user (injected via dependency).

    Returns:
        The Medi AI model's response text.

    Raises:
        HTTPException: If the guard blocks the request or Ollama fails.
    """
    try:
        user_message = message.message.strip()

        if not user_message:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty after trimming whitespace.",
            )

        # Build context with user info and optional prediction data
        context = message.context or {}
        context["user"] = {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "role": current_user.role.value,
        }

        # Run medical topic guard
        guard_result = medical_guard.check(user_message, context)

        if guard_result.decision == GuardDecision.BLOCK:
            logger.warning(
                f"Medical guard blocked message from user {current_user.id}: "
                f"{guard_result.reason}"
            )
            return ChatResponse(
                response=_format_guard_response(guard_result),
                guard_decision=guard_result.decision.value,
                guard_category=guard_result.category.value if guard_result.category else None,
            )

        # Check Ollama health
        if not await ollama_service.check_health():
            logger.error("Ollama health check failed")
            raise HTTPException(
                status_code=503,
                detail=(
                    "Medi AI is currently unavailable. Please make sure Ollama is running "
                    "with the required model (hf.co/empero-ai/Qwen3.8-2B-Distill-GGUF:Q5_K_M)."
                ),
            )

        # Send to Ollama
        ollama_response = await ollama_service.send_message(
            user_message,
            context=context,
            timeout_seconds=60,
        )

        if ollama_response is None:
            logger.error("Ollama failed to produce a response")
            raise HTTPException(
                status_code=502,
                detail="Medi AI failed to produce a response. Please try again.",
            )

        return ChatResponse(
            response=ollama_response,
            guard_decision=guard_result.decision.value,
            guard_category=guard_result.category.value if guard_result.category else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in /api/chat: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your message.",
        )


@router.get("/chat/health")
async def chat_health() -> Dict[str, Any]:
    """Health check for the chat service including Ollama connectivity."""
    ollama_healthy = await ollama_service.check_health()
    return {
        "status": "healthy" if ollama_healthy else "degraded",
        "ollama_connected": ollama_healthy,
        "model": ollama_service.model_name,
        "base_url": ollama_service.base_url,
    }