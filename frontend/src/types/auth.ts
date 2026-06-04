import { ApiRequestError, type ApiErrorDetail, type ApiErrorResponse } from '@/types/api'

export interface LoginRequest {
  userCode: string
  password: string
}

export interface AuthSession {
  sessionId: string
  userCode: string
  loginName: string
  csrfToken: string
  lastLoginAt: string
}

export type { ApiErrorDetail, ApiErrorResponse }

export class AuthApiError extends ApiRequestError {
  constructor(detail: ApiErrorDetail, status: number) {
    super('AuthApiError', detail, status)
  }
}