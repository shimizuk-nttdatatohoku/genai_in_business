"""Domain models used across repositories and services."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UserRecord:
    """Persisted member record."""

    user_code: str
    user_name: str
    user_name_kana: str
    birth_date: str
    postal_code: str
    address: str
    phone_number: str
    email: str
    share_balance_amount: str
    notification_method: int
    account_registration_info: str | None
    editable: bool
    password_hash: str
    last_login_at: str | None


@dataclass(frozen=True)
class AuthSessionRecord:
    """Persisted login session record."""

    session_id: str
    user_code: str
    login_name: str
    csrf_token: str
    created_at: str
    last_login_at: str
    expire_at: int


@dataclass(frozen=True)
class AuthenticatedUser:
    """Authenticated request context."""

    session_id: str
    user_code: str
    login_name: str
    csrf_token: str


@dataclass(frozen=True)
class DistributionRecord:
    """Persisted dividend distribution record."""

    record_id: str
    user_code: str
    notice_id: str
    fiscal_year: int
    title: str
    published_at: str
    receipt_status: str
    receipt_method: str
    receipt_method_change_deadline: str | None
    receipt_method_note: str | None
    detail_items: list[dict[str, str | None]]
    precautions: list[str]
    updated_at: str
    version: int


@dataclass(frozen=True)
class DividendNoticeRecord:
    """Persisted dividend notice master record."""

    notice_id: str
    fiscal_year: int
    title: str
    published_at: str


@dataclass(frozen=True)
class ReceiptMethodRecord:
    """Persisted receipt method master record."""

    code: str
    label: str
    is_active: bool


@dataclass(frozen=True)
class NoticeReadRecord:
    """Persisted notice-read state."""

    record_id: str
    user_code: str
    notice_id: str
    read_at: str