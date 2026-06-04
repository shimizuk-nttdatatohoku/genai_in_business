"""Business logic for member profile operations."""

from __future__ import annotations

import re

from app.common.errors import NotFoundError, ValidationAppError
from app.common.security import utc_now_isoformat
from app.models.domain import UserRecord
from app.repositories.users import UserRepository
from app.schemas.users import (
    MemberProfileResponse,
    UpdateMemberProfileRequest,
    UpdateMemberProfileResponse,
)


class UserService:
    """Load and update the authenticated member profile."""

    def __init__(self, user_repository: UserRepository) -> None:
        """Initialize the service with its repository."""
        self._user_repository = user_repository

    def get_profile(self, user_code: str) -> MemberProfileResponse:
        """Return the profile for the authenticated member."""
        user = self._get_user(user_code)
        return self._to_profile_response(user)

    def update_profile(
        self,
        user_code: str,
        request: UpdateMemberProfileRequest,
    ) -> UpdateMemberProfileResponse:
        """Update editable profile fields for the authenticated member."""
        self._validate_update_request(request)
        self._get_user(user_code)
        self._user_repository.update_profile(
            user_code=user_code,
            postal_code=request.postalCode,
            address=request.address,
            phone_number=request.phoneNumber,
            email=request.email,
            notification_method=request.notificationMethod,
            account_registration_info=request.accountRegistrationInfo,
        )
        return UpdateMemberProfileResponse(
            updatedAt=utc_now_isoformat(),
            message="更新しました",
        )

    def _validate_update_request(self, request: UpdateMemberProfileRequest) -> None:
        """Validate editable member profile fields."""
        if not request.postalCode:
            raise ValidationAppError("E_101", "郵便番号は必須です")
        if not re.fullmatch(r"\d{7}", request.postalCode):
            raise ValidationAppError("E_102", "郵便番号の形式が正しくありません")
        if not request.address:
            raise ValidationAppError("E_101", "住所は必須です")
        if len(request.address) > 100 or "\n" in request.address or "\r" in request.address:
            raise ValidationAppError("E_102", "住所の形式が正しくありません")
        if not request.phoneNumber:
            raise ValidationAppError("E_101", "電話番号は必須です")
        if not re.fullmatch(r"[0-9-]{10,13}", request.phoneNumber):
            raise ValidationAppError("E_102", "電話番号の形式が正しくありません")
        if not request.email:
            raise ValidationAppError("E_101", "メールアドレスは必須です")
        if len(request.email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", request.email):
            raise ValidationAppError("E_102", "メールアドレスの形式が正しくありません")
        if request.notificationMethod not in {0, 1}:
            raise ValidationAppError("E_102", "通知方法の形式が正しくありません")
        if request.accountRegistrationInfo and len(request.accountRegistrationInfo) > 100:
            raise ValidationAppError("E_102", "口座登録情報の形式が正しくありません")

    def _get_user(self, user_code: str) -> UserRecord:
        """Load a member profile or fail if it does not exist."""
        user = self._user_repository.get_by_user_code(user_code)
        if user is None:
            raise NotFoundError("組合員情報が見つかりません")
        return user

    def _to_profile_response(self, user: UserRecord) -> MemberProfileResponse:
        """Convert a user domain record into an API response schema."""
        return MemberProfileResponse(
            userCode=user.user_code,
            userName=user.user_name,
            userNameKana=user.user_name_kana,
            birthDate=user.birth_date,
            postalCode=user.postal_code,
            address=user.address,
            phoneNumber=user.phone_number,
            email=user.email,
            shareBalanceAmount=user.share_balance_amount,
            notificationMethod=user.notification_method,
            accountRegistrationInfo=user.account_registration_info,
            editable=user.editable,
        )