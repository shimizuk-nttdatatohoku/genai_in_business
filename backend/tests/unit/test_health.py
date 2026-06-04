"""Unit tests for the backend health endpoint."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_get_health_returns_success_payload(client: TestClient) -> None:
    """Test that the health check returns the success envelope.

    Args:
        client: FastAPI test client.
    """
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "data": {"status": "ok"},
        "errors": [],
    }
    assert "X-Request-Id" in response.headers
