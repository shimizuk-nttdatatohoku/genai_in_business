"""Structured logging helpers for API requests."""

from __future__ import annotations

import logging


class _RequestContextFilter(logging.Filter):
    """Provide default request metadata for log records that do not set it."""

    def filter(self, record: logging.LogRecord) -> bool:
        """Inject default structured logging fields when they are missing."""
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        if not hasattr(record, "endpoint"):
            record.endpoint = "-"
        if not hasattr(record, "method"):
            record.method = "-"
        if not hasattr(record, "user_id"):
            record.user_id = "-"
        return True


def _configure_root_logger() -> None:
    """Configure the root logger once with the project's structured format."""
    root_logger = logging.getLogger()
    context_filter = _RequestContextFilter()

    if not root_logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s %(name)s "
                "request_id=%(request_id)s endpoint=%(endpoint)s method=%(method)s "
                "user_id=%(user_id)s %(message)s"
            )
        )
        handler.addFilter(context_filter)
        root_logger.addHandler(handler)
        root_logger.setLevel(logging.INFO)
        return

    for handler in root_logger.handlers:
        handler.addFilter(context_filter)


def get_logger(name: str) -> logging.Logger:
    """Return a configured logger for the given module name."""
    _configure_root_logger()
    return logging.getLogger(name)


def mask_user_id(user_id: str | None) -> str:
    """Mask a user identifier before it is emitted to logs."""
    if not user_id:
        return "-"
    if len(user_id) <= 4:
        return "*" * len(user_id)
    return f"{user_id[:2]}***{user_id[-2:]}"


def build_log_extra(
    request_id: str,
    endpoint: str,
    method: str,
    user_id: str | None = None,
) -> dict[str, str]:
    """Build the structured logging fields required by backend rules."""
    return {
        "request_id": request_id,
        "endpoint": endpoint,
        "method": method,
        "user_id": mask_user_id(user_id),
    }
