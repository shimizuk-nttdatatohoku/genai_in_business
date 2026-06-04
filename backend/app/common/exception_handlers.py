"""Centralized API exception handlers."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.common.errors import AppError
from app.common.logging import build_log_extra, get_logger
from app.common.responses import error_response

logger = get_logger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register shared exception handlers on the FastAPI application."""

    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        """Handle known application errors with a standard response body."""
        extra = build_log_extra(
            getattr(request.state, "request_id", "unknown"),
            request.url.path,
            request.method,
            getattr(request.state, "user_code", None),
        )
        logger.warning(
            "application_error code=%s message=%s",
            exc.code,
            exc.message,
            extra=extra,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(code=exc.code, message=exc.message),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Handle request validation failures with a standard response body."""
        extra = build_log_extra(
            getattr(request.state, "request_id", "unknown"),
            request.url.path,
            request.method,
            getattr(request.state, "user_code", None),
        )
        logger.warning("validation_error errors=%s", exc.errors(), extra=extra)
        has_missing_field = any(error.get("type") == "missing" for error in exc.errors())
        return JSONResponse(
            status_code=400,
            content=error_response(
                code="E_101" if has_missing_field else "E_102",
                message="入力内容を確認してください",
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Handle uncaught exceptions without leaking internal details."""
        extra = build_log_extra(
            getattr(request.state, "request_id", "unknown"),
            request.url.path,
            request.method,
            getattr(request.state, "user_code", None),
        )
        logger.exception("unexpected_error %s", str(exc), extra=extra)
        return JSONResponse(
            status_code=500,
            content=error_response(code="E_901", message="システムエラーが発生しました"),
        )
