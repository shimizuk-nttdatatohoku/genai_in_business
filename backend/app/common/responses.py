"""Standard API response builders."""

from __future__ import annotations

from typing import Any


def success_response(data: Any) -> dict[str, Any]:
    """Create the standard success response body."""
    return {"success": True, "data": data, "errors": []}


def error_response(code: str, message: str) -> dict[str, Any]:
    """Create the standard error response body."""
    return {
        "success": False,
        "data": None,
        "errors": [{"code": code, "message": message}],
    }
