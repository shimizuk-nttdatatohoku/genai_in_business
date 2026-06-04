"""Health check router for backend readiness verification."""

from fastapi import APIRouter

from app.common.responses import success_response

router = APIRouter(tags=["health"])


@router.get("/health")
async def get_health() -> dict[str, object]:
    """Return the application health status."""
    return success_response({"status": "ok"})