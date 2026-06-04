"""Shared pytest fixtures for backend tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from moto import mock_aws

from app.main import app
from app.common.settings import get_settings
from infra.scripts.create_local_tables import ensure_tables, seed_sample_data


@pytest.fixture(autouse=True)
def configure_test_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    """Set deterministic environment variables for backend tests."""
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("APP_NAME", "Member Backend API Test")
    monkeypatch.setenv("AWS_REGION", "ap-northeast-1")
    monkeypatch.delenv("DYNAMODB_ENDPOINT", raising=False)
    monkeypatch.setenv("USERS_TABLE", "users")
    monkeypatch.setenv("DIVIDEND_NOTICES_TABLE", "dividend_notices")
    monkeypatch.setenv("DISTRIBUTIONS_TABLE", "distributions")
    monkeypatch.setenv("NOTICE_READS_TABLE", "notice_reads")
    monkeypatch.setenv("RECEIPT_METHODS_TABLE", "receipt_methods")
    monkeypatch.setenv("AUTH_SESSIONS_TABLE", "auth_sessions")
    monkeypatch.setenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )


@pytest.fixture
def client() -> TestClient:
    """Create a synchronous test client for API tests."""
    return TestClient(app)


@pytest.fixture
def aws_mock() -> mock_aws:
    """Provide a moto-backed AWS mock context for DynamoDB tests."""
    with mock_aws():
        yield


@pytest.fixture
def seeded_dynamodb(aws_mock: None) -> None:
    """Create all tables and seed deterministic sample data for API tests."""
    settings = get_settings()
    ensure_tables(settings)
    seed_sample_data(settings)


@pytest.fixture
def authenticated_client(client: TestClient, seeded_dynamodb: None) -> TestClient:
    """Return a test client that already holds a valid session cookie."""
    response = client.post(
        "/api/v1/auth-sessions",
        json={"userCode": "123456", "password": "password123"},
    )
    assert response.status_code == 201
    client.headers.update({"X-CSRF-Token": response.json()["csrfToken"]})
    return client
