"""Repository for user-specific dividend distribution records."""

from __future__ import annotations

from decimal import Decimal

from boto3.dynamodb.conditions import Attr
from boto3.resources.base import ServiceResource

from app.common.settings import AppSettings
from app.models.domain import DistributionRecord


class DistributionRepository:
    """Load and persist user-specific dividend distribution records."""

    def __init__(self, dynamodb_resource: ServiceResource, settings: AppSettings) -> None:
        """Initialize the repository with the configured table."""
        self._table = dynamodb_resource.Table(settings.distributions_table)

    def list_by_user_code(self, user_code: str) -> list[DistributionRecord]:
        """Return all distribution records for a user."""
        response = self._table.scan(FilterExpression=Attr("user_code").eq(user_code))
        return [self._deserialize(item) for item in response.get("Items", [])]

    def get_by_user_and_notice(
        self,
        user_code: str,
        notice_id: str,
    ) -> DistributionRecord | None:
        """Return a single distribution record for a user and notice."""
        response = self._table.get_item(Key={"_id": f"DIST#{user_code}#{notice_id}"})
        item = response.get("Item")
        if item is None:
            return None
        return self._deserialize(item)

    def update_receipt_method(
        self,
        distribution: DistributionRecord,
        receipt_method: str,
        updated_at: str,
    ) -> DistributionRecord:
        """Persist a receipt method update and return the refreshed record."""
        new_version = distribution.version if distribution.receipt_method == receipt_method else distribution.version + 1
        self._table.update_item(
            Key={"_id": distribution.record_id},
            UpdateExpression=(
                "SET receipt_method = :receipt_method, updated_at = :updated_at, version = :version"
            ),
            ExpressionAttributeValues={
                ":receipt_method": receipt_method,
                ":updated_at": updated_at,
                ":version": new_version,
            },
        )
        refreshed = self.get_by_user_and_notice(distribution.user_code, distribution.notice_id)
        if refreshed is None:
            raise KeyError(f"Distribution not found after update: {distribution.record_id}")
        return refreshed

    def _deserialize(self, item: dict[str, object]) -> DistributionRecord:
        """Convert a DynamoDB item into a domain record."""
        return DistributionRecord(
            record_id=str(item["_id"]),
            user_code=str(item["user_code"]),
            notice_id=str(item["notice_id"]),
            fiscal_year=int(item["fiscal_year"]),
            title=str(item["title"]),
            published_at=str(item["published_at"]),
            receipt_status=str(item["receipt_status"]),
            receipt_method=str(item["receipt_method"]),
            receipt_method_change_deadline=(
                None
                if item.get("receipt_method_change_deadline") in {None, ""}
                else str(item["receipt_method_change_deadline"])
            ),
            receipt_method_note=(
                None if item.get("receipt_method_note") in {None, ""} else str(item["receipt_method_note"])
            ),
            detail_items=list(item.get("detail_items", [])),
            precautions=[str(value) for value in item.get("precautions", [])],
            updated_at=str(item["updated_at"]),
            version=int(item["version"]),
        )