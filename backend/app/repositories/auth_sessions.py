"""Repository for persisted authentication sessions."""

from __future__ import annotations

from boto3.resources.base import ServiceResource

from app.common.settings import AppSettings
from app.models.domain import AuthSessionRecord


class AuthSessionRepository:
    """Persist and load login sessions from DynamoDB."""

    def __init__(self, dynamodb_resource: ServiceResource, settings: AppSettings) -> None:
        """Initialize the repository with the configured table."""
        self._table = dynamodb_resource.Table(settings.auth_sessions_table)

    def create(self, session: AuthSessionRecord) -> None:
        """Store a new session record."""
        self._table.put_item(
            Item={
                "_id": f"SESSION#{session.session_id}",
                "session_id": session.session_id,
                "user_code": session.user_code,
                "login_name": session.login_name,
                "csrf_token": session.csrf_token,
                "created_at": session.created_at,
                "last_login_at": session.last_login_at,
                "expire_at": session.expire_at,
            }
        )

    def get_by_session_id(self, session_id: str) -> AuthSessionRecord | None:
        """Load a session record by session identifier."""
        response = self._table.get_item(Key={"_id": f"SESSION#{session_id}"})
        item = response.get("Item")
        if item is None:
            return None
        return AuthSessionRecord(
            session_id=str(item["session_id"]),
            user_code=str(item["user_code"]),
            login_name=str(item["login_name"]),
            csrf_token=str(item["csrf_token"]),
            created_at=str(item["created_at"]),
            last_login_at=str(item["last_login_at"]),
            expire_at=int(item["expire_at"]),
        )

    def delete(self, session_id: str) -> None:
        """Remove a persisted session."""
        self._table.delete_item(Key={"_id": f"SESSION#{session_id}"})