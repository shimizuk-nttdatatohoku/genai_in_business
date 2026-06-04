"""Repository for receipt method master data."""

from __future__ import annotations

from boto3.dynamodb.conditions import Attr
from boto3.resources.base import ServiceResource

from app.common.settings import AppSettings
from app.models.domain import ReceiptMethodRecord


class ReceiptMethodRepository:
    """Load active receipt method master records."""

    def __init__(self, dynamodb_resource: ServiceResource, settings: AppSettings) -> None:
        """Initialize the repository with the configured table."""
        self._table = dynamodb_resource.Table(settings.receipt_methods_table)

    def list_active(self) -> list[ReceiptMethodRecord]:
        """Return all active receipt method options."""
        response = self._table.scan(FilterExpression=Attr("is_active").eq(True))
        return [
            ReceiptMethodRecord(
                code=str(item["code"]),
                label=str(item["label"]),
                is_active=bool(item["is_active"]),
            )
            for item in response.get("Items", [])
        ]