"""Unit tests for dividend notice endpoints."""

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


def test_list_dividend_notices_returns_seeded_items(
    authenticated_client: TestClient,
) -> None:
    """Test that the notice list returns paginated summaries.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.get("/api/v1/dividend-notices?page=1&pageSize=20")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["userCode"] == "123456"
    assert len(response.json()["data"]["items"]) == 2
    assert response.json()["data"]["items"][0]["noticeId"] == "ntc-2026-0001"
    assert response.json()["data"]["items"][0]["isNew"] is True
    assert response.json()["errors"] == []


def test_list_dividend_notices_requires_authentication(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that the notice list requires authentication.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.get("/api/v1/dividend-notices?page=1&pageSize=20")

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="ログインしてください",
    )


def test_list_dividend_notices_validates_page_size(
    authenticated_client: TestClient,
) -> None:
    """Test that the notice list validates query parameters.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.get("/api/v1/dividend-notices?page=1&pageSize=101")

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_102",
        message="入力内容を確認してください",
    )


def test_get_dividend_notice_detail_marks_notice_as_read(
    authenticated_client: TestClient,
) -> None:
    """Test that notice detail marks the notice as read.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    detail_response = authenticated_client.get("/api/v1/dividend-notices/ntc-2026-0001")
    list_response = authenticated_client.get("/api/v1/dividend-notices?page=1&pageSize=20")

    assert detail_response.status_code == 200
    assert detail_response.json()["success"] is True
    assert detail_response.json()["data"]["receiptMethod"] == "BANK_TRANSFER"
    assert len(detail_response.json()["data"]["receiptMethodOptions"]) == 3
    assert detail_response.json()["errors"] == []
    assert list_response.json()["data"]["items"][0]["isNew"] is False


def test_get_dividend_notice_detail_requires_authentication(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that notice detail requires authentication.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.get("/api/v1/dividend-notices/ntc-2026-0001")

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="ログインしてください",
    )


def test_get_dividend_notice_detail_returns_not_found(
    authenticated_client: TestClient,
) -> None:
    """Test that notice detail returns 404 for unknown notices.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.get("/api/v1/dividend-notices/unknown-notice")

    assert response.status_code == 404
    assert_standard_error(
        response.json(),
        code="E_404",
        message="お知らせが見つかりません",
    )


def test_update_dividend_notice_receipt_method_updates_selection(
    authenticated_client: TestClient,
) -> None:
    """Test that receipt method updates persist a valid selection.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/dividend-notices/ntc-2026-0001/receipt-method",
        json={"receiptMethod": "COUNTER_PICKUP"},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["receiptMethod"] == "COUNTER_PICKUP"
    assert response.json()["data"]["message"] == "配当金受取方法を更新しました"
    assert response.json()["errors"] == []


def test_update_dividend_notice_receipt_method_requires_authentication(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that receipt method updates require authentication.

    Args:
        client: FastAPI test client.
        seeded_dynamodb: Seeded DynamoDB fixture.
    """
    response = client.put(
        "/api/v1/dividend-notices/ntc-2026-0001/receipt-method",
        json={"receiptMethod": "COUNTER_PICKUP"},
    )

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="ログインしてください",
    )


def test_update_dividend_notice_receipt_method_requires_csrf(
    client: TestClient,
    seeded_dynamodb: None,
) -> None:
    """Test that receipt method updates reject missing CSRF tokens.

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
        "/api/v1/dividend-notices/ntc-2026-0001/receipt-method",
        json={"receiptMethod": "COUNTER_PICKUP"},
    )

    assert response.status_code == 401
    assert_standard_error(
        response.json(),
        code="E_001",
        message="CSRFトークンが正しくありません",
    )


def test_update_dividend_notice_receipt_method_requires_receipt_method(
    authenticated_client: TestClient,
) -> None:
    """Test that receipt method updates validate missing fields.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/dividend-notices/ntc-2026-0001/receipt-method",
        json={},
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_101",
        message="入力内容を確認してください",
    )


def test_update_dividend_notice_receipt_method_validates_receipt_method(
    authenticated_client: TestClient,
) -> None:
    """Test that receipt method updates validate unsupported values.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/dividend-notices/ntc-2026-0001/receipt-method",
        json={"receiptMethod": "INVALID"},
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_102",
        message="配当金受取方法を正しく選択してください",
    )


def test_update_dividend_notice_receipt_method_rejects_account_transfer(
    authenticated_client: TestClient,
) -> None:
    """Test that business rules reject account transfer updates.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/dividend-notices/ntc-2026-0001/receipt-method",
        json={"receiptMethod": "ACCOUNT_TRANSFER"},
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_201",
        message="受付期間外のため変更できません",
    )


def test_update_dividend_notice_receipt_method_rejects_received_notice(
    authenticated_client: TestClient,
) -> None:
    """Test that receipt method updates reject received notices.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/dividend-notices/ntc-2025-0001/receipt-method",
        json={"receiptMethod": "BANK_TRANSFER"},
    )

    assert response.status_code == 400
    assert_standard_error(
        response.json(),
        code="E_202",
        message="受取済みのため変更できません",
    )


def test_update_dividend_notice_receipt_method_returns_not_found(
    authenticated_client: TestClient,
) -> None:
    """Test that receipt method updates return 404 for unknown notices.

    Args:
        authenticated_client: Authenticated FastAPI test client.
    """
    response = authenticated_client.put(
        "/api/v1/dividend-notices/unknown-notice/receipt-method",
        json={"receiptMethod": "COUNTER_PICKUP"},
    )

    assert response.status_code == 404
    assert_standard_error(
        response.json(),
        code="E_404",
        message="お知らせが見つかりません",
    )