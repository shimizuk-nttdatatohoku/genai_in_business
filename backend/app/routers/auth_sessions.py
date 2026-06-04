"""Routers for login and logout endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.responses import JSONResponse

from app.common.dependencies import get_app_settings, get_auth_service
from app.common.responses import success_response
from app.common.settings import AppSettings
from app.schemas.auth import AuthSessionResponse, LoginRequest
from app.services.auth import AuthService

router = APIRouter(prefix="/api/v1/auth-sessions", tags=["auth-sessions"])


@router.post("", response_model=AuthSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_auth_session(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
    settings: AppSettings = Depends(get_app_settings),
) -> JSONResponse:
    """Authenticate a member and create a new session cookie."""
    session = auth_service.create_session(payload)
    response = JSONResponse(status_code=status.HTTP_201_CREATED, content=session.model_dump())
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session.sessionId,
        httponly=True,
        secure=settings.app_env not in {"local", "test"},
        samesite="lax",
        max_age=settings.session_ttl_seconds,
    )
    return response


@router.delete("/current")
async def delete_current_auth_session(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    settings: AppSettings = Depends(get_app_settings),
) -> Response:
    """Delete the current authenticated session."""
    session_id = request.cookies.get(settings.session_cookie_name)
    authenticated_user = auth_service.get_authenticated_user(session_id)
    auth_service.validate_csrf(authenticated_user, request.headers.get("X-CSRF-Token"))
    logged_out_at = auth_service.delete_session(session_id)
    response = JSONResponse(content=success_response({"loggedOutAt": logged_out_at}))
    response.delete_cookie(settings.session_cookie_name)
    return response