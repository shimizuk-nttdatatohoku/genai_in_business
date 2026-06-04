"""Pydantic schemas for member profile endpoints."""

from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict


class MemberProfileResponse(BaseModel):
    """Response payload for the current member profile."""

    userCode: str
    userName: str
    userNameKana: str
    birthDate: str
    postalCode: str
    address: str
    phoneNumber: str
    email: str
    shareBalanceAmount: str
    notificationMethod: int
    accountRegistrationInfo: str | None
    editable: bool


class UpdateMemberProfileRequest(BaseModel):
    """Request payload for updating the current member profile."""

    model_config = ConfigDict(str_strip_whitespace=True)

    postalCode: str
    address: str
    phoneNumber: str
    email: str
    notificationMethod: int
    accountRegistrationInfo: str | None = None


class UpdateMemberProfileResponse(BaseModel):
    """Response payload after updating the current member profile."""

    updatedAt: str
    message: str