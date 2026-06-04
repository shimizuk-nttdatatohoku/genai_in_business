"""Business logic for dividend notice endpoints."""

from __future__ import annotations

from datetime import date

from app.common.errors import BusinessRuleError, NotFoundError, ValidationAppError
from app.common.security import utc_now_isoformat
from app.repositories.distributions import DistributionRepository
from app.repositories.notice_reads import NoticeReadRepository
from app.repositories.receipt_methods import ReceiptMethodRepository
from app.repositories.users import UserRepository
from app.schemas.dividend_notices import (
    DetailItemResponse,
    DividendNoticeDetailResponse,
    DividendNoticeListResponse,
    DividendNoticeSummaryResponse,
    PaginationResponse,
    ReceiptMethodOptionResponse,
    UpdateReceiptMethodRequest,
    UpdateReceiptMethodResponse,
)


class DividendNoticeService:
    """Load and update dividend notice data for the authenticated member."""

    def __init__(
        self,
        user_repository: UserRepository,
        distribution_repository: DistributionRepository,
        notice_read_repository: NoticeReadRepository,
        receipt_method_repository: ReceiptMethodRepository,
    ) -> None:
        """Initialize the service with its repositories."""
        self._user_repository = user_repository
        self._distribution_repository = distribution_repository
        self._notice_read_repository = notice_read_repository
        self._receipt_method_repository = receipt_method_repository

    def list_notices(
        self,
        user_code: str,
        page: int,
        page_size: int,
    ) -> DividendNoticeListResponse:
        """Return the paginated notice list for the authenticated user."""
        user = self._require_user(user_code)
        distributions = sorted(
            self._distribution_repository.list_by_user_code(user_code),
            key=lambda item: (item.fiscal_year, item.published_at),
            reverse=True,
        )
        read_notice_ids = self._notice_read_repository.list_read_notice_ids(user_code)
        total_count = len(distributions)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paged_items = distributions[start_index:end_index]

        return DividendNoticeListResponse(
            userCode=user.user_code,
            loginName=user.user_name,
            items=[
                DividendNoticeSummaryResponse(
                    noticeId=item.notice_id,
                    fiscalYear=item.fiscal_year,
                    title=item.title,
                    isNew=item.notice_id not in read_notice_ids,
                    publishedAt=item.published_at,
                )
                for item in paged_items
            ],
            pagination=PaginationResponse(
                page=page,
                pageSize=page_size,
                totalCount=total_count,
            ),
        )

    def get_notice_detail(
        self,
        user_code: str,
        notice_id: str,
    ) -> DividendNoticeDetailResponse:
        """Return detail data for a single notice."""
        user = self._require_user(user_code)
        distribution = self._require_distribution(user_code, notice_id)
        receipt_methods = self._receipt_method_repository.list_active()
        self._notice_read_repository.mark_as_read(user_code, notice_id, utc_now_isoformat())

        return DividendNoticeDetailResponse(
            noticeId=distribution.notice_id,
            title=distribution.title,
            userCode=user.user_code,
            loginName=user.user_name,
            receiptStatus=distribution.receipt_status,
            receiptMethod=distribution.receipt_method,
            receiptMethodOptions=[
                ReceiptMethodOptionResponse(code=item.code, label=item.label)
                for item in receipt_methods
            ],
            canUpdateReceiptMethod=self._can_update_receipt_method(distribution),
            receiptMethodChangeDeadline=distribution.receipt_method_change_deadline,
            receiptMethodNote=distribution.receipt_method_note,
            detailItems=[
                DetailItemResponse(
                    itemName=str(item["itemName"]),
                    value=str(item["value"]),
                    note=None if item.get("note") is None else str(item["note"]),
                )
                for item in distribution.detail_items
            ],
            precautions=distribution.precautions,
        )

    def update_receipt_method(
        self,
        user_code: str,
        notice_id: str,
        request: UpdateReceiptMethodRequest,
    ) -> UpdateReceiptMethodResponse:
        """Update the receipt method for a notice when the business rules allow it."""
        self._require_user(user_code)
        distribution = self._require_distribution(user_code, notice_id)
        self._validate_receipt_method_request(request)

        if distribution.receipt_status == "RECEIVED":
            raise BusinessRuleError("E_202", "受取済みのため変更できません")
        if request.receiptMethod == "ACCOUNT_TRANSFER":
            raise BusinessRuleError("E_201", "受付期間外のため変更できません")
        if not self._can_update_receipt_method(distribution):
            raise BusinessRuleError("E_201", "受付期間外のため変更できません")

        updated_at = distribution.updated_at
        if distribution.receipt_method != request.receiptMethod:
            updated_at = utc_now_isoformat()
            distribution = self._distribution_repository.update_receipt_method(
                distribution,
                request.receiptMethod,
                updated_at,
            )

        return UpdateReceiptMethodResponse(
            noticeId=distribution.notice_id,
            receiptStatus=distribution.receipt_status,
            receiptMethod=distribution.receipt_method,
            updatedAt=updated_at,
            message="配当金受取方法を更新しました",
        )

    def _require_user(self, user_code: str):
        """Load the current user or fail when missing."""
        user = self._user_repository.get_by_user_code(user_code)
        if user is None:
            raise NotFoundError("組合員情報が見つかりません")
        return user

    def _require_distribution(self, user_code: str, notice_id: str):
        """Load a notice distribution or fail when missing."""
        distribution = self._distribution_repository.get_by_user_and_notice(user_code, notice_id)
        if distribution is None:
            raise NotFoundError("お知らせが見つかりません")
        return distribution

    def _validate_receipt_method_request(self, request: UpdateReceiptMethodRequest) -> None:
        """Validate a receipt method update request."""
        if not request.receiptMethod:
            raise ValidationAppError("E_101", "配当金受取方法を選択してください")
        allowed_methods = {item.code for item in self._receipt_method_repository.list_active()}
        if request.receiptMethod not in allowed_methods:
            raise ValidationAppError("E_102", "配当金受取方法を正しく選択してください")

    def _can_update_receipt_method(self, distribution) -> bool:
        """Return whether the notice is still within the editable period."""
        if distribution.receipt_status == "RECEIVED":
            return False
        if not distribution.receipt_method_change_deadline:
            return True
        return date.fromisoformat(distribution.receipt_method_change_deadline) >= date.today()