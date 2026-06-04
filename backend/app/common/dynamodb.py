"""DynamoDB client and resource factories."""

from __future__ import annotations

import boto3
from boto3.resources.base import ServiceResource

from app.common.settings import get_settings


def get_dynamodb_resource() -> ServiceResource:
    """Create a DynamoDB resource using environment-driven configuration."""
    settings = get_settings()
    resource_kwargs: dict[str, str] = {"region_name": settings.aws_region}
    if settings.dynamodb_endpoint:
        resource_kwargs["endpoint_url"] = settings.dynamodb_endpoint
    return boto3.resource("dynamodb", **resource_kwargs)
