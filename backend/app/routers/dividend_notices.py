"""Dividend notice router placeholder."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.common.dependencies import (
	get_dividend_notice_service,
	require_authenticated_user,
	require_csrf_protected_user,
)
from app.common.responses import success_response
from app.schemas.dividend_notices import UpdateReceiptMethodRequest
from app.services.dividend_notices import DividendNoticeService

router = APIRouter(prefix="/api/v1/dividend-notices", tags=["dividend-notices"])


@router.get("")
async def list_dividend_notices(
	page: int = Query(default=1, ge=1),
	page_size: int = Query(default=20, alias="pageSize", ge=1, le=100),
	user_code: str = Depends(require_authenticated_user),
	dividend_notice_service: DividendNoticeService = Depends(get_dividend_notice_service),
) -> dict[str, object]:
	"""Return the paginated notice list for the authenticated user."""
	result = dividend_notice_service.list_notices(user_code, page, page_size)
	return success_response(result.model_dump())


@router.get("/{notice_id}")
async def get_dividend_notice_detail(
	notice_id: str,
	user_code: str = Depends(require_authenticated_user),
	dividend_notice_service: DividendNoticeService = Depends(get_dividend_notice_service),
) -> dict[str, object]:
	"""Return detail data for a single notice."""
	result = dividend_notice_service.get_notice_detail(user_code, notice_id)
	return success_response(result.model_dump())


@router.put("/{notice_id}/receipt-method")
async def update_dividend_notice_receipt_method(
	notice_id: str,
	payload: UpdateReceiptMethodRequest,
	user_code: str = Depends(require_csrf_protected_user),
	dividend_notice_service: DividendNoticeService = Depends(get_dividend_notice_service),
) -> dict[str, object]:
	"""Update the receipt method for a single notice."""
	result = dividend_notice_service.update_receipt_method(user_code, notice_id, payload)
	return success_response(result.model_dump())