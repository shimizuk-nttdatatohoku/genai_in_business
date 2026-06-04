"""FastAPI application entry point for local development and AWS Lambda."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.common.exception_handlers import register_exception_handlers
from app.common.middleware import RequestContextMiddleware
from app.common.settings import get_settings
from app.routers.auth_sessions import router as auth_sessions_router
from app.routers.dividend_notices import router as dividend_notices_router
from app.routers.health import router as health_router
from app.routers.users import router as users_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)
    app.include_router(health_router)
    app.include_router(auth_sessions_router)
    app.include_router(dividend_notices_router)
    app.include_router(users_router)
    return app


app = create_app()
handler = Mangum(app)
