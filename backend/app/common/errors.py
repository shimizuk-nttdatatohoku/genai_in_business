"""Application-level exceptions."""

from __future__ import annotations


class AppError(Exception):
    """Base application error with HTTP and error-code metadata."""

    def __init__(self, code: str, message: str, status_code: int) -> None:
        """Initialize an application error."""
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


class ValidationAppError(AppError):
    """Raised when request data is missing or malformed."""

    def __init__(self, code: str, message: str) -> None:
        """Initialize a validation error."""
        super().__init__(code=code, message=message, status_code=400)


class AuthenticationError(AppError):
    """Raised when authentication fails."""

    def __init__(self, message: str = "認証に失敗しました") -> None:
        """Initialize an authentication error."""
        super().__init__(code="E_001", message=message, status_code=401)


class AuthorizationError(AppError):
    """Raised when access to a resource is not permitted."""

    def __init__(self, message: str = "アクセス権限がありません") -> None:
        """Initialize an authorization error."""
        super().__init__(code="E_002", message=message, status_code=403)


class BusinessRuleError(AppError):
    """Raised when business rule validation fails."""

    def __init__(self, code: str, message: str) -> None:
        """Initialize a business rule error."""
        super().__init__(code=code, message=message, status_code=400)


class NotFoundError(AppError):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str) -> None:
        """Initialize a not-found error."""
        super().__init__(code="E_404", message=message, status_code=404)


class SystemError(AppError):
    """Raised when an unexpected backend condition occurs."""

    def __init__(self, message: str = "システムエラーが発生しました") -> None:
        """Initialize a system error."""
        super().__init__(code="E_901", message=message, status_code=500)


class ConfigurationError(SystemError):
    """Raised when required runtime configuration is invalid."""

    def __init__(self, message: str) -> None:
        """Initialize a configuration error."""
        super().__init__(message=message)
