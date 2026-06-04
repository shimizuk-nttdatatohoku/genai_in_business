"""Routers for member profile endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.common.dependencies import (
    get_user_service,
    require_authenticated_user,
    require_csrf_protected_user,
)
from app.common.responses import success_response
from app.schemas.users import (
    UpdateMemberProfileRequest,
)
from app.services.users import UserService

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me")
async def get_my_profile(
    user_code: str = Depends(require_authenticated_user),
    user_service: UserService = Depends(get_user_service),
) -> dict[str, object]:
    """Return the authenticated member profile."""
    profile = user_service.get_profile(user_code)
    return success_response(profile.model_dump())


@router.put("/me")
async def update_my_profile(
    payload: UpdateMemberProfileRequest,
    user_code: str = Depends(require_csrf_protected_user),
    user_service: UserService = Depends(get_user_service),
) -> dict[str, object]:
    """Update editable fields in the authenticated member profile."""
    result = user_service.update_profile(user_code, payload)
    return success_response(result.model_dump())