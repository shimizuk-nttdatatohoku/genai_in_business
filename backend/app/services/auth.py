"""Business logic for authentication and session management."""

from __future__ import annotations

from datetime import timedelta
import re

from app.common.errors import AuthenticationError, ValidationAppError
from app.common.security import generate_token, utc_now, utc_now_isoformat, verify_password
from app.common.settings import AppSettings
from app.models.domain import AuthSessionRecord, AuthenticatedUser
from app.repositories.auth_sessions import AuthSessionRepository
from app.repositories.users import UserRepository
from app.schemas.auth import AuthSessionResponse, LoginRequest


class AuthService:
    """Authenticate members and manage persisted sessions."""

    def __init__(
        self,
        user_repository: UserRepository,
        auth_session_repository: AuthSessionRepository,
        settings: AppSettings,
    ) -> None:
        """Initialize the service with its dependencies."""
        self._user_repository = user_repository
        self._auth_session_repository = auth_session_repository
        self._settings = settings

    def create_session(self, request: LoginRequest) -> AuthSessionResponse:
        """Authenticate a member and create a persisted session."""
        self._validate_login_request(request)
        user = self._user_repository.get_by_user_code(request.user_code)
        if user is None or not verify_password(
            request.user_code,
            request.password,
            user.password_hash,
        ):
            raise AuthenticationError("組合員コードまたはパスワードが正しくありません")

        last_login_at = utc_now_isoformat()
        session = AuthSessionRecord(
            session_id=generate_token(24),
            user_code=user.user_code,
            login_name=user.user_name,
            csrf_token=generate_token(24),
            created_at=last_login_at,
            last_login_at=last_login_at,
            expire_at=int((utc_now() + timedelta(seconds=self._settings.session_ttl_seconds)).timestamp()),
        )
        self._auth_session_repository.create(session)
        self._user_repository.update_login_timestamp(user.user_code, last_login_at)
        return AuthSessionResponse(
            sessionId=session.session_id,
            userCode=user.user_code,
            loginName=user.user_name,
            csrfToken=session.csrf_token,
            lastLoginAt=last_login_at,
        )

    def get_authenticated_user(self, session_id: str | None) -> AuthenticatedUser:
        """Resolve the authenticated user from the session cookie."""
        if not session_id:
            raise AuthenticationError("ログインしてください")

        session = self._auth_session_repository.get_by_session_id(session_id)
        if session is None or session.expire_at <= int(utc_now().timestamp()):
            raise AuthenticationError("セッションの有効期限が切れています")

        return AuthenticatedUser(
            session_id=session.session_id,
            user_code=session.user_code,
            login_name=session.login_name,
            csrf_token=session.csrf_token,
        )

    def validate_csrf(self, authenticated_user: AuthenticatedUser, csrf_token: str | None) -> None:
        """Validate the anti-CSRF token for state-changing requests."""
        if not csrf_token or csrf_token != authenticated_user.csrf_token:
            raise AuthenticationError("CSRFトークンが正しくありません")

    def delete_session(self, session_id: str | None) -> str:
        """Delete an authenticated session and return the logout timestamp."""
        authenticated_user = self.get_authenticated_user(session_id)
        self._auth_session_repository.delete(authenticated_user.session_id)
        return utc_now_isoformat()

    def _validate_login_request(self, request: LoginRequest) -> None:
        """Validate the login request payload."""
        if not request.user_code:
            raise ValidationAppError("E_101", "組合員コードは必須です")
        if not re.fullmatch(r"\d{6,10}", request.user_code):
            raise ValidationAppError("E_102", "組合員コードの形式が正しくありません")
        if not request.password:
            raise ValidationAppError("E_101", "パスワードは必須です")
        if not 8 <= len(request.password) <= 32:
            raise ValidationAppError(
                "E_102",
                "パスワードは8文字以上32文字以下で入力してください",
            )