"""Environment-driven application settings."""

from __future__ import annotations

import os
from dataclasses import dataclass


def _split_csv(value: str | None, default: list[str]) -> list[str]:
    """Split a comma-separated environment variable into a list."""
    if value is None or not value.strip():
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class AppSettings:
    """Application settings loaded from environment variables."""

    app_name: str
    app_env: str
    aws_region: str
    dynamodb_endpoint: str | None
    users_table: str
    dividend_notices_table: str
    distributions_table: str
    notice_reads_table: str
    receipt_methods_table: str
    auth_sessions_table: str
    cors_allow_origins: list[str]
    session_cookie_name: str
    session_ttl_seconds: int


def get_settings() -> AppSettings:
    """Load immutable application settings from environment variables."""
    return AppSettings(
        app_name=os.getenv("APP_NAME", "Member Backend API"),
        app_env=os.getenv("APP_ENV", "local"),
        aws_region=os.getenv("AWS_REGION", "ap-northeast-1"),
        dynamodb_endpoint=os.getenv("DYNAMODB_ENDPOINT") or None,
        users_table=os.getenv("USERS_TABLE", "users"),
        dividend_notices_table=os.getenv(
            "DIVIDEND_NOTICES_TABLE", "dividend_notices"
        ),
        distributions_table=os.getenv("DISTRIBUTIONS_TABLE", "distributions"),
        notice_reads_table=os.getenv("NOTICE_READS_TABLE", "notice_reads"),
        receipt_methods_table=os.getenv(
            "RECEIPT_METHODS_TABLE", "receipt_methods"
        ),
        auth_sessions_table=os.getenv("AUTH_SESSIONS_TABLE", "auth_sessions"),
        cors_allow_origins=_split_csv(
            os.getenv("CORS_ALLOW_ORIGINS"),
            ["http://localhost:5173", "http://127.0.0.1:5173"],
        ),
        session_cookie_name=os.getenv("SESSION_COOKIE_NAME", "member_session"),
        session_ttl_seconds=int(os.getenv("SESSION_TTL_SECONDS", "43200")),
    )
