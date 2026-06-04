"""Integration-style tests for DynamoDB development helpers."""

from __future__ import annotations

import boto3

from app.common.dynamodb import get_dynamodb_resource
from app.common.settings import get_settings
from infra.scripts.create_local_tables import ensure_tables, seed_sample_data


def test_ensure_tables_creates_expected_tables(aws_mock: None) -> None:
    """The local table creation script should create all required tables."""
    settings = get_settings()

    created_tables = ensure_tables(settings)
    dynamodb_client = boto3.client("dynamodb", region_name=settings.aws_region)
    listed_tables = set(dynamodb_client.list_tables()["TableNames"])

    assert set(created_tables) == {
        settings.users_table,
        settings.dividend_notices_table,
        settings.distributions_table,
        settings.notice_reads_table,
        settings.receipt_methods_table,
        settings.auth_sessions_table,
    }
    assert settings.auth_sessions_table in listed_tables


def test_get_dynamodb_resource_returns_configured_resource(aws_mock: None) -> None:
    """The shared DynamoDB factory should return a DynamoDB resource."""
    resource = get_dynamodb_resource()

    assert resource.meta.client.meta.service_model.service_name == "dynamodb"


def test_seed_sample_data_populates_core_tables(aws_mock: None) -> None:
    """The local seed helper should populate all tables with a usable sample dataset."""
    settings = get_settings()
    ensure_tables(settings)

    seeded_counts = seed_sample_data(settings)
    dynamodb_resource = boto3.resource("dynamodb", region_name=settings.aws_region)

    users_count = dynamodb_resource.Table(settings.users_table).scan()["Count"]
    receipt_methods_count = dynamodb_resource.Table(settings.receipt_methods_table).scan()["Count"]

    assert seeded_counts["users"] == 2
    assert seeded_counts["distributions"] == 2
    assert users_count == 2
    assert receipt_methods_count == 3
