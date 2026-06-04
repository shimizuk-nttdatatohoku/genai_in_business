"""Pydantic schemas for authentication endpoints."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Login request payload."""

    model_config = ConfigDict(str_strip_whitespace=True, populate_by_name=True)

    user_code: str = Field(alias="userCode")
    password: str


class AuthSessionResponse(BaseModel):
    """Created authentication session payload."""

    sessionId: str
    userCode: str
    loginName: str
    csrfToken: str
    lastLoginAt: str