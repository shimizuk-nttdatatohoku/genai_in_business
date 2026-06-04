"""Unit tests for authentication session endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient


def assert_standard_error(
    response_json: dict[str, object],
    *,
    code: str,
    message: str,
) -> None:
    """Assert that an error response uses the shared API envelope.

    Args:
        response_json: Parsed JSON response body.
        code: Expected application error code.
        message: Expected user-facing error message.
    """
    assert response_json == {
        "success": False,
        "data": None,
        "errors": [{"code": code, "message": message}],
    }


def test_create_auth_session_returns_session_payload(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that login creates a cookie-backed session.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.post(
        "/api/v1/auth-sessions",
        json={"userCode": "123456", "password": "password123"},
    )

    assert response.status_code == 201
    assert response.json()["sessionId"]
    assert response.json()["userCode"] == "123456"
    assert response.json()["loginName"] == "山田 太郎"
    assert response.json()["csrfToken"]
    assert response.json()["lastLoginAt"]
    assert "member_session" in response.cookies


def test_create_auth_session_rejects_invalid_credentials(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that login rejects invalid credentials.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.post(
        "/api/v1/auth-sessions",
        json={"userCode": "123456", "password": "wrongpass"},
    )

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="組合員コードまたはパスワードが正しくありません",
    )


def test_create_auth_session_requires_user_code(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that login validates missing required fields.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.post(
        "/api/v1/auth-sessions",
        json={"password": "password123"},
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_101",
        message="入力内容を確認してください",
    )


def test_create_auth_session_validates_user_code_format(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that login validates malformed user codes.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.post(
        "/api/v1/auth-sessions",
        json={"userCode": "abc", "password": "password123"},
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_102",
        message="組合員コードの形式が正しくありません",
    )


def test_delete_current_auth_session_requires_authentication(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that logout requires an authenticated session.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.delete("/api/v1/auth-sessions/current")

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="ログインしてください",
    )


def test_delete_current_auth_session_requires_csrf(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that logout rejects requests without a CSRF token.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    login_response = client.post(
        "/api/v1/auth-sessions",
        json={"userCode": "123456", "password": "password123"},
    )
    assert login_response.status_code == 201

    response = client.delete("/api/v1/auth-sessions/current")

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="CSRFトークンが正しくありません",
    )


def test_delete_current_auth_session_rejects_invalid_csrf(
    authenticated_client: TestClient,
) -> None:
    """Test that logout rejects an invalid CSRF token.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    authenticated_client.headers.update({"X-CSRF-Token": "invalid-token"})

    response = authenticated_client.delete("/api/v1/auth-sessions/current")

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="CSRFトークンが正しくありません",
    )


def test_delete_current_auth_session_logs_out(
    authenticated_client: TestClient,
) -> None:
    """Test that logout clears the current session.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.delete("/api/v1/auth-sessions/current")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["loggedOutAt"]
    assert response.json()["errors"] == []