"""Create the local DynamoDB tables required by the backend."""

from __future__ import annotations

from collections.abc import Iterable
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

from app.common.security import hash_password, utc_now_isoformat
from app.common.settings import AppSettings, get_settings


def _build_resource_kwargs(settings: AppSettings) -> dict[str, str]:
    """Build DynamoDB connection arguments from application settings."""
    resource_kwargs: dict[str, str] = {"region_name": settings.aws_region}
    if settings.dynamodb_endpoint:
        resource_kwargs["endpoint_url"] = settings.dynamodb_endpoint
    return resource_kwargs


def get_table_definitions(settings: AppSettings) -> list[dict[str, object]]:
    """Return the DynamoDB table definitions used by the application."""
    table_names = [
        settings.users_table,
        settings.dividend_notices_table,
        settings.distributions_table,
        settings.notice_reads_table,
        settings.receipt_methods_table,
        settings.auth_sessions_table,
    ]

    return [
        {
            "TableName": table_name,
            "AttributeDefinitions": [
                {"AttributeName": "_id", "AttributeType": "S"},
            ],
            "KeySchema": [{"AttributeName": "_id", "KeyType": "HASH"}],
            "BillingMode": "PAY_PER_REQUEST",
        }
        for table_name in table_names
    ]


def ensure_tables(settings: AppSettings) -> list[str]:
    """Create all required tables if they do not already exist."""
    resource_kwargs = _build_resource_kwargs(settings)
    dynamodb_resource = boto3.resource("dynamodb", **resource_kwargs)
    dynamodb_client = boto3.client("dynamodb", **resource_kwargs)
    existing_tables = set(dynamodb_client.list_tables()["TableNames"])
    created_tables: list[str] = []

    for table_definition in get_table_definitions(settings):
        table_name = str(table_definition["TableName"])
        if table_name in existing_tables:
            continue

        table = dynamodb_resource.create_table(**table_definition)
        table.wait_until_exists()
        created_tables.append(table_name)

    _enable_time_to_live(
        dynamodb_client=dynamodb_client,
        table_name=settings.auth_sessions_table,
        attribute_name="expire_at",
    )
    return created_tables


def seed_sample_data(settings: AppSettings) -> dict[str, int]:
    """Seed the local tables with a minimal but complete sample dataset."""
    resource_kwargs = _build_resource_kwargs(settings)
    dynamodb_resource = boto3.resource("dynamodb", **resource_kwargs)

    users_table = dynamodb_resource.Table(settings.users_table)
    notices_table = dynamodb_resource.Table(settings.dividend_notices_table)
    distributions_table = dynamodb_resource.Table(settings.distributions_table)
    notice_reads_table = dynamodb_resource.Table(settings.notice_reads_table)
    receipt_methods_table = dynamodb_resource.Table(settings.receipt_methods_table)

    seed_timestamp = utc_now_isoformat()

    user_items = [
        {
            "_id": "USER#123456",
            "user_code": "123456",
            "user_name": "山田 太郎",
            "user_name_kana": "ヤマダ タロウ",
            "birth_date": "1987-11-01",
            "postal_code": "9999999",
            "address": "宮城県仙台市青葉区中央1-1-2",
            "phone_number": "090-1234-5678",
            "email": "member@example.com",
            "share_balance_amount": "5000.00",
            "notification_method": Decimal("1"),
            "account_registration_info": "未登録",
            "editable": True,
            "password_hash": hash_password("123456", "password123"),
            "last_login_at": "2026-06-01T09:00:00Z",
        },
        {
            "_id": "USER#654321",
            "user_code": "654321",
            "user_name": "鈴木 花子",
            "user_name_kana": "スズキ ハナコ",
            "birth_date": "1990-05-21",
            "postal_code": "1111111",
            "address": "東京都千代田区丸の内1-1-1",
            "phone_number": "080-1111-2222",
            "email": "another@example.com",
            "share_balance_amount": "2500.00",
            "notification_method": Decimal("0"),
            "account_registration_info": None,
            "editable": True,
            "password_hash": hash_password("654321", "password123"),
            "last_login_at": "2026-05-31T10:30:00Z",
        },
    ]
    notice_items = [
        {
            "_id": "NOTICE#ntc-2026-0001",
            "notice_id": "ntc-2026-0001",
            "fiscal_year": Decimal("2026"),
            "title": "2026年度分 出資配当金・出資金残高等のお知らせ",
            "published_at": "2026-05-01T09:00:00Z",
        },
        {
            "_id": "NOTICE#ntc-2025-0001",
            "notice_id": "ntc-2025-0001",
            "fiscal_year": Decimal("2025"),
            "title": "2025年度分 出資配当金・出資金残高等のお知らせ",
            "published_at": "2025-05-01T09:00:00Z",
        },
    ]
    distribution_items = [
        {
            "_id": "DIST#123456#ntc-2026-0001",
            "user_code": "123456",
            "notice_id": "ntc-2026-0001",
            "fiscal_year": Decimal("2026"),
            "title": "2026年度分 出資配当金・出資金残高等のお知らせ",
            "published_at": "2026-05-01T09:00:00Z",
            "receipt_status": "UNRECEIVED",
            "receipt_method": "BANK_TRANSFER",
            "receipt_method_change_deadline": "2099-12-31",
            "receipt_method_note": "現金受取への変更は締切前のみ可能です。",
            "detail_items": [
                {"itemName": "出資金残高", "value": "5,000円", "note": "2026年4月30日現在"},
                {"itemName": "出資配当率", "value": "1.20%", "note": "第32回総代会決定事項"},
                {
                    "itemName": "出資配当率（税引後）",
                    "value": "1.159%",
                    "note": "出資配当金は日割り計算です",
                },
            ],
            "precautions": [
                "配当金受取方法の変更は締切日まで可能です。",
                "現金受取を選択した場合は窓口での本人確認が必要です。",
            ],
            "updated_at": seed_timestamp,
            "version": Decimal("1"),
        },
        {
            "_id": "DIST#123456#ntc-2025-0001",
            "user_code": "123456",
            "notice_id": "ntc-2025-0001",
            "fiscal_year": Decimal("2025"),
            "title": "2025年度分 出資配当金・出資金残高等のお知らせ",
            "published_at": "2025-05-01T09:00:00Z",
            "receipt_status": "RECEIVED",
            "receipt_method": "COUNTER_PICKUP",
            "receipt_method_change_deadline": "2025-05-31",
            "receipt_method_note": None,
            "detail_items": [
                {"itemName": "出資金残高", "value": "4,500円", "note": None},
            ],
            "precautions": ["受取済みのため変更できません。"],
            "updated_at": "2025-05-15T10:00:00Z",
            "version": Decimal("2"),
        },
    ]
    notice_read_items = [
        {
            "_id": "READ#123456#ntc-2025-0001",
            "user_code": "123456",
            "notice_id": "ntc-2025-0001",
            "read_at": "2025-05-10T09:00:00Z",
        },
    ]
    receipt_method_items = [
        {"_id": "METHOD#BANK_TRANSFER", "code": "BANK_TRANSFER", "label": "登録口座振込", "is_active": True},
        {"_id": "METHOD#ACCOUNT_TRANSFER", "code": "ACCOUNT_TRANSFER", "label": "出資振替", "is_active": True},
        {"_id": "METHOD#COUNTER_PICKUP", "code": "COUNTER_PICKUP", "label": "現金受取", "is_active": True},
    ]

    for table, items in [
        (users_table, user_items),
        (notices_table, notice_items),
        (distributions_table, distribution_items),
        (notice_reads_table, notice_read_items),
        (receipt_methods_table, receipt_method_items),
    ]:
        with table.batch_writer(overwrite_by_pkeys=["_id"]) as batch:
            for item in items:
                batch.put_item(Item=item)

    return {
        "users": len(user_items),
        "dividend_notices": len(notice_items),
        "distributions": len(distribution_items),
        "notice_reads": len(notice_read_items),
        "receipt_methods": len(receipt_method_items),
    }


def _enable_time_to_live(
    dynamodb_client: object, table_name: str, attribute_name: str
) -> None:
    """Enable TTL for the auth sessions table when the backend supports it."""
    try:
        dynamodb_client.update_time_to_live(
            TableName=table_name,
            TimeToLiveSpecification={
                "Enabled": True,
                "AttributeName": attribute_name,
            },
        )
    except ClientError:
        return


def format_created_tables(table_names: Iterable[str]) -> str:
    """Build a human-readable result summary."""
    names = list(table_names)
    if not names:
        return "No tables were created."
    return "Created tables: " + ", ".join(names)


def main() -> None:
    """Create local DynamoDB tables for backend development."""
    settings = get_settings()
    created_tables = ensure_tables(settings)
    seeded_counts = seed_sample_data(settings)
    print(format_created_tables(created_tables))
    print(f"Seeded sample data: {seeded_counts}")


if __name__ == "__main__":
    main()
