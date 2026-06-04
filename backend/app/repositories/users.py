"""Repository for member profile records."""

from __future__ import annotations

from decimal import Decimal

from boto3.resources.base import ServiceResource

from app.common.settings import AppSettings
from app.models.domain import UserRecord


def _to_int(value: int | Decimal) -> int:
    """Convert a DynamoDB numeric field into an integer."""
    return int(value)


class UserRepository:
    """Load and persist member profile records."""

    def __init__(self, dynamodb_resource: ServiceResource, settings: AppSettings) -> None:
        """Initialize the repository with the configured table."""
        self._table = dynamodb_resource.Table(settings.users_table)

    def get_by_user_code(self, user_code: str) -> UserRecord | None:
        """Fetch a member record by user code."""
        response = self._table.get_item(Key={"_id": f"USER#{user_code}"})
        item = response.get("Item")
        if item is None:
            return None
        return self._deserialize(item)

    def update_login_timestamp(self, user_code: str, last_login_at: str) -> None:
        """Persist the latest successful login timestamp."""
        self._table.update_item(
            Key={"_id": f"USER#{user_code}"},
            UpdateExpression="SET last_login_at = :last_login_at",
            ExpressionAttributeValues={":last_login_at": last_login_at},
        )

    def update_profile(
        self,
        user_code: str,
        postal_code: str,
        address: str,
        phone_number: str,
        email: str,
        notification_method: int,
        account_registration_info: str | None,
    ) -> UserRecord:
        """Update editable profile fields and return the refreshed record."""
        self._table.update_item(
            Key={"_id": f"USER#{user_code}"},
            UpdateExpression=(
                "SET postal_code = :postal_code, address = :address, phone_number = :phone_number, "
                "email = :email, notification_method = :notification_method, "
                "account_registration_info = :account_registration_info"
            ),
            ExpressionAttributeValues={
                ":postal_code": postal_code,
                ":address": address,
                ":phone_number": phone_number,
                ":email": email,
                ":notification_method": notification_method,
                ":account_registration_info": account_registration_info,
            },
        )
        updated_user = self.get_by_user_code(user_code)
        if updated_user is None:
            raise KeyError(f"User not found after update: {user_code}")
        return updated_user

    def _deserialize(self, item: dict[str, object]) -> UserRecord:
        """Convert a DynamoDB item into a domain record."""
        return UserRecord(
            user_code=str(item["user_code"]),
            user_name=str(item["user_name"]),
            user_name_kana=str(item["user_name_kana"]),
            birth_date=str(item["birth_date"]),
            postal_code=str(item["postal_code"]),
            address=str(item["address"]),
            phone_number=str(item["phone_number"]),
            email=str(item["email"]),
            share_balance_amount=str(item["share_balance_amount"]),
            notification_method=_to_int(item["notification_method"]),
            account_registration_info=(
                None
                if item.get("account_registration_info") in {None, ""}
                else str(item["account_registration_info"])
            ),
            editable=bool(item["editable"]),
            password_hash=str(item["password_hash"]),
            last_login_at=(
                None if item.get("last_login_at") is None else str(item["last_login_at"])
            ),
        )