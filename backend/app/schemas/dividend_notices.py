"""Pydantic schemas for dividend notice endpoints."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class DividendNoticeSummaryResponse(BaseModel):
    """Summary item in the dividend notice list."""

    noticeId: str
    fiscalYear: int
    title: str
    isNew: bool
    publishedAt: str


class PaginationResponse(BaseModel):
    """Pagination metadata returned for a list response."""

    page: int
    pageSize: int
    totalCount: int


class DividendNoticeListResponse(BaseModel):
    """Response payload for the dividend notice list."""

    userCode: str
    loginName: str
    items: list[DividendNoticeSummaryResponse]
    pagination: PaginationResponse


class ReceiptMethodOptionResponse(BaseModel):
    """Selectable receipt method option."""

    code: str
    label: str


class DetailItemResponse(BaseModel):
    """Detailed notice item."""

    itemName: str
    value: str
    note: str | None


class DividendNoticeDetailResponse(BaseModel):
    """Response payload for a single dividend notice."""

    noticeId: str
    title: str
    userCode: str
    loginName: str
    receiptStatus: str
    receiptMethod: str
    receiptMethodOptions: list[ReceiptMethodOptionResponse]
    canUpdateReceiptMethod: bool
    receiptMethodChangeDeadline: str | None
    receiptMethodNote: str | None
    detailItems: list[DetailItemResponse]
    precautions: list[str]


class UpdateReceiptMethodRequest(BaseModel):
    """Request payload for updating the receipt method."""

    model_config = ConfigDict(str_strip_whitespace=True)

    receiptMethod: str


class UpdateReceiptMethodResponse(BaseModel):
    """Response payload after updating the receipt method."""

    noticeId: str
    receiptStatus: str
    receiptMethod: str
    updatedAt: str
    message: str