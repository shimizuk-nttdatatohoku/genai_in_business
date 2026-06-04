"""Unit tests for the current-user endpoints."""

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


def test_get_my_profile_returns_member_payload(authenticated_client: TestClient) -> None:
    """Test that the current-user endpoint returns seeded data.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.get("/api/v1/users/me")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["userCode"] == "123456"
    assert response.json()["data"]["userName"] == "山田 太郎"
    assert response.json()["errors"] == []


def test_get_my_profile_requires_authentication(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that the current-user endpoint requires authentication.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.get("/api/v1/users/me")

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="ログインしてください",
    )


def test_update_my_profile_persists_changes(authenticated_client: TestClient) -> None:
    """Test that editable profile fields are persisted.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    update_response = authenticated_client.put(
        "/api/v1/users/me",
        json={
            "postalCode": "9800001",
            "address": "宮城県仙台市青葉区本町1-2-3",
            "phoneNumber": "090-9999-8888",
            "email": "updated@example.com",
            "notificationMethod": 0,
            "accountRegistrationInfo": "登録済",
        },
    )
    profile_response = authenticated_client.get("/api/v1/users/me")

    assert update_response.status_code == 200
    assert update_response.json()["success"] is True
    assert update_response.json()["data"]["message"] == "更新しました"
    assert update_response.json()["errors"] == []
    assert profile_response.json()["data"]["postalCode"] == "9800001"
    assert profile_response.json()["data"]["notificationMethod"] == 0


def test_update_my_profile_requires_authentication(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that profile updates require authentication.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.put(
        "/api/v1/users/me",
        json={
            "postalCode": "9800001",
            "address": "宮城県仙台市青葉区本町1-2-3",
            "phoneNumber": "090-9999-8888",
            "email": "updated@example.com",
            "notificationMethod": 0,
            "accountRegistrationInfo": "登録済",
        },
    )

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="ログインしてください",
    )


def test_update_my_profile_requires_csrf(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that profile updates reject missing CSRF tokens.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    login_response = client.post(
        "/api/v1/auth-sessions",
        json={"userCode": "123456", "password": "password123"},
    )
    assert login_response.status_code == 201

    response = client.put(
        "/api/v1/users/me",
        json={
            "postalCode": "9800001",
            "address": "宮城県仙台市青葉区本町1-2-3",
            "phoneNumber": "090-9999-8888",
            "email": "updated@example.com",
            "notificationMethod": 0,
            "accountRegistrationInfo": "登録済",
        },
    )

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="CSRFトークンが正しくありません",
    )


def test_update_my_profile_requires_postal_code(
    authenticated_client: TestClient,
) -> None:
    """Test that profile updates validate missing required fields.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/users/me",
        json={
            "address": "宮城県仙台市青葉区本町1-2-3",
            "phoneNumber": "090-9999-8888",
            "email": "updated@example.com",
            "notificationMethod": 0,
            "accountRegistrationInfo": "登録済",
        },
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_101",
        message="入力内容を確認してください",
    )


def test_update_my_profile_validates_format(authenticated_client: TestClient) -> None:
    """Test that profile updates validate malformed fields.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/users/me",
        json={
            "postalCode": "abc",
            "address": "宮城県仙台市青葉区本町1-2-3",
            "phoneNumber": "090-9999-8888",
            "email": "updated@example.com",
            "notificationMethod": 0,
            "accountRegistrationInfo": "登録済",
        },
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_102",
        message="郵便番号の形式が正しくありません",
    )