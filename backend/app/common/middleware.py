"""Shared middleware for request context and audit logging."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.common.logging import build_log_extra, get_logger

logger = get_logger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach request metadata and emit request completion logs."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Add a request id to the request state and response headers."""
        request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))
        request.state.request_id = request_id
        request.state.user_code = None

        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id

        extra = build_log_extra(
            request_id,
            request.url.path,
            request.method,
            getattr(request.state, "user_code", None),
        )
        logger.info(
            "request_completed status_code=%s",
            response.status_code,
            extra=extra,
        )
        return response
