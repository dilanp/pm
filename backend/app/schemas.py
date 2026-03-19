from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class CardPayload(BaseModel):
    title: str
    details: str
    position: int = Field(ge=0)


class ColumnPayload(BaseModel):
    title: str
    position: int = Field(ge=0)
    cards: list[CardPayload]


class BoardPayload(BaseModel):
    title: str
    columns: list[ColumnPayload]


class BoardEnvelope(BaseModel):
    board: BoardPayload


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class AIChatRequest(BaseModel):
    prompt: str
    board: BoardPayload
    history: list[ChatMessage] = []


class AIChatStructuredResponse(BaseModel):
    message: str
    board: BoardPayload | None = None
