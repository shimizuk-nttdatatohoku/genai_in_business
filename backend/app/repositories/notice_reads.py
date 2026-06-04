"""Repository for notice read tracking."""

from __future__ import annotations

from boto3.dynamodb.conditions import Attr
from boto3.resources.base import ServiceResource

from app.common.settings import AppSettings


class NoticeReadRepository:
    """Load and persist notice read state per user."""

    def __init__(self, dynamodb_resource: ServiceResource, settings: AppSettings) -> None:
        """Initialize the repository with the configured table."""
        self._table = dynamodb_resource.Table(settings.notice_reads_table)

    def list_read_notice_ids(self, user_code: str) -> set[str]:
        """Return the notice ids that the user has already opened."""
        response = self._table.scan(FilterExpression=Attr("user_code").eq(user_code))
        return {str(item["notice_id"]) for item in response.get("Items", [])}

    def mark_as_read(self, user_code: str, notice_id: str, read_at: str) -> None:
        """Persist a read marker for a notice."""
        self._table.put_item(
            Item={
                "_id": f"READ#{user_code}#{notice_id}",
                "user_code": user_code,
                "notice_id": notice_id,
                "read_at": read_at,
            }
        )