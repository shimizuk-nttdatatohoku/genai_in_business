"""Security-related helpers for password hashing and token generation."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime


def hash_password(user_code: str, password: str) -> str:
    """Create a deterministic password hash for the PoC backend."""
    payload = f"{user_code}:{password}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def verify_password(user_code: str, password: str, expected_hash: str) -> bool:
    """Verify a password against the persisted hash."""
    return hmac.compare_digest(hash_password(user_code, password), expected_hash)


def generate_token(length: int = 32) -> str:
    """Generate a cryptographically random token."""
    return secrets.token_urlsafe(length)


def utc_now() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(UTC)


def utc_now_isoformat() -> str:
    """Return the current UTC timestamp in ISO8601 format."""
    return utc_now().isoformat().replace("+00:00", "Z")