from __future__ import annotations

import json
import logging
import os
import random
import time
from typing import Any

import httpx
from fastapi import HTTPException, status
from pydantic import ValidationError

from backend.app.schemas import AIChatStructuredResponse

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-oss-120b"

DEFAULT_TIMEOUT = httpx.Timeout(60.0, connect=5.0, read=60.0, write=10.0, pool=10.0)
MAX_RETRIES = 3
RETRY_STATUSES = {429, 500, 502, 503, 504}
LOG_SNIPPET_LIMIT = 500

logger = logging.getLogger("backend.ai")


def _snippet(value: str, limit: int = LOG_SNIPPET_LIMIT) -> str:
    if len(value) <= limit:
        return value
    return f"{value[:limit]}..."


def _auth_headers() -> dict[str, str]:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENROUTER_API_KEY is not set",
        )
    return {"Authorization": f"Bearer {api_key}"}


def call_openrouter(prompt: str) -> str:
    return call_openrouter_messages([
        {"role": "user", "content": prompt},
    ], max_tokens=32)


def call_openrouter_messages(messages: list[dict[str, str]], max_tokens: int = 512) -> str:
    headers = _auth_headers()
    headers.update(
        {
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Project Management MVP",
        }
    )

    payload: dict[str, Any] = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0,
        "max_tokens": max_tokens,
    }

    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = client.post(OPENROUTER_API_URL, headers=headers, json=payload)
            except httpx.RequestError as exc:
                logger.warning("OpenRouter request failed on attempt %s: %s", attempt, exc)
                _sleep_backoff(attempt)
                continue

            if response.status_code in RETRY_STATUSES:
                logger.warning(
                    "OpenRouter retryable status on attempt %s: %s",
                    attempt,
                    response.status_code,
                )
                _sleep_backoff(attempt)
                continue

            if response.status_code >= 400:
                snippet = _snippet(response.text)
                logger.error(
                    "OpenRouter error status %s: %s",
                    response.status_code,
                    snippet,
                )
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="AI service request failed",
                )

            data = response.json()
            return _extract_message(data)

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="AI service request failed after retries",
    )


def parse_ai_response(payload: str) -> AIChatStructuredResponse:
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        logger.error("AI response was not valid JSON: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service response was not valid JSON",
        ) from exc

    try:
        return AIChatStructuredResponse.model_validate(data)
    except ValidationError as exc:
        logger.error("OpenRouter response validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service response validation failed",
        ) from exc


def _extract_message(data: dict[str, Any]) -> str:
    try:
        choices = data.get("choices", [])
        message = choices[0].get("message", {}) if choices else {}
        content = message.get("content", "")
        return str(content).strip()
    except (AttributeError, IndexError, TypeError) as exc:
        logger.error("OpenRouter response parse error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service response parse error",
        ) from exc


def _sleep_backoff(attempt: int) -> None:
    if attempt >= MAX_RETRIES:
        return
    base = 0.5 * (2 ** (attempt - 1))
    jitter = random.uniform(0, 0.2)
    time.sleep(base + jitter)
