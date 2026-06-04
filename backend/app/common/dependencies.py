"""Shared dependency providers for routers."""

from __future__ import annotations

from fastapi import Depends, Request

from app.common.dynamodb import get_dynamodb_resource
from app.common.settings import AppSettings, get_settings
from app.repositories.auth_sessions import AuthSessionRepository
from app.repositories.distributions import DistributionRepository
from app.repositories.notice_reads import NoticeReadRepository
from app.repositories.receipt_methods import ReceiptMethodRepository
from app.repositories.users import UserRepository
from app.services.auth import AuthService
from app.services.dividend_notices import DividendNoticeService
from app.services.users import UserService


def get_app_settings() -> AppSettings:
    """Return the current application settings."""
    return get_settings()


def get_user_repository(settings: AppSettings = Depends(get_app_settings)) -> UserRepository:
    """Build a member repository for the current request."""
    return UserRepository(get_dynamodb_resource(), settings)


def get_auth_session_repository(
    settings: AppSettings = Depends(get_app_settings),
) -> AuthSessionRepository:
    """Build an auth session repository for the current request."""
    return AuthSessionRepository(get_dynamodb_resource(), settings)


def get_distribution_repository(
    settings: AppSettings = Depends(get_app_settings),
) -> DistributionRepository:
    """Build a distribution repository for the current request."""
    return DistributionRepository(get_dynamodb_resource(), settings)


def get_notice_read_repository(
    settings: AppSettings = Depends(get_app_settings),
) -> NoticeReadRepository:
    """Build a notice-read repository for the current request."""
    return NoticeReadRepository(get_dynamodb_resource(), settings)


def get_receipt_method_repository(
    settings: AppSettings = Depends(get_app_settings),
) -> ReceiptMethodRepository:
    """Build a receipt-method repository for the current request."""
    return ReceiptMethodRepository(get_dynamodb_resource(), settings)


def get_auth_service(
    settings: AppSettings = Depends(get_app_settings),
    user_repository: UserRepository = Depends(get_user_repository),
    auth_session_repository: AuthSessionRepository = Depends(get_auth_session_repository),
) -> AuthService:
    """Build the authentication service for the current request."""
    return AuthService(user_repository, auth_session_repository, settings)


def get_user_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> UserService:
    """Build the member profile service for the current request."""
    return UserService(user_repository)


async def require_authenticated_user(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    settings: AppSettings = Depends(get_app_settings),
) -> str:
    """Resolve the current authenticated user code from the session cookie."""
    session_id = request.cookies.get(settings.session_cookie_name)
    authenticated_user = auth_service.get_authenticated_user(session_id)
    request.state.user_code = authenticated_user.user_code
    return authenticated_user.user_code


async def require_csrf_protected_user(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    settings: AppSettings = Depends(get_app_settings),
) -> str:
    """Resolve the current authenticated user and validate the CSRF token."""
    session_id = request.cookies.get(settings.session_cookie_name)
    authenticated_user = auth_service.get_authenticated_user(session_id)
    auth_service.validate_csrf(
        authenticated_user,
        request.headers.get("X-CSRF-Token"),
    )
    request.state.user_code = authenticated_user.user_code
    return authenticated_user.user_code


def get_dividend_notice_service() -> DividendNoticeService:
    """Build the dividend notice service for the current request."""
    settings = get_settings()
    dynamodb_resource = get_dynamodb_resource()
    return DividendNoticeService(
        user_repository=UserRepository(dynamodb_resource, settings),
        distribution_repository=DistributionRepository(dynamodb_resource, settings),
        notice_read_repository=NoticeReadRepository(dynamodb_resource, settings),
        receipt_method_repository=ReceiptMethodRepository(dynamodb_resource, settings),
    )