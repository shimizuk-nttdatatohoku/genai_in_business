"""Repository for dividend notice master records."""

from __future__ import annotations

from decimal import Decimal

from boto3.resources.base import ServiceResource

from app.common.settings import AppSettings
from app.models.domain import DividendNoticeRecord


class DividendNoticeRepository:
    """Load dividend notice master records from DynamoDB."""

    def __init__(self, dynamodb_resource: ServiceResource, settings: AppSettings) -> None:
        """Initialize the repository with the configured table."""
        self._table = dynamodb_resource.Table(settings.dividend_notices_table)

    def get_by_notice_id(self, notice_id: str) -> DividendNoticeRecord | None:
        """Fetch a notice master record by its notice identifier."""
        response = self._table.get_item(Key={"_id": f"NOTICE#{notice_id}"})
        item = response.get("Item")
        if item is None:
            return None
        return DividendNoticeRecord(
            notice_id=str(item["notice_id"]),
            fiscal_year=int(item["fiscal_year"]),
            title=str(item["title"]),
            published_at=str(item["published_at"]),
        )