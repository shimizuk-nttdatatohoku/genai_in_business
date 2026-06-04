import { AuthApiError, type ApiErrorDetail, type ApiErrorResponse, type AuthSession, type LoginRequest } from '@/types/auth'

import { clearCsrfToken, getCsrfToken, saveCsrfToken } from '@/api/csrf'

const AUTH_SESSION_PATH = '/api/v1/auth-sessions'
const CURRENT_AUTH_SESSION_PATH = '/api/v1/auth-sessions/current'

const FALLBACK_ERROR: ApiErrorDetail = {
  code: 'E_901',
  message: '時間をおいて再度お試しください',
}

function buildApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL?.trim()

  if (!baseUrl) {
    return path
  }

  return new URL(path, `${baseUrl.replace(/\/$/, '')}/`).toString()
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeErrors = Reflect.get(value, 'errors')

  return (
    Array.isArray(maybeErrors) &&
    maybeErrors.every((error) => {
      if (typeof error !== 'object' || error === null) {
        return false
      }

      return (
        typeof Reflect.get(error, 'code') === 'string' &&
        typeof Reflect.get(error, 'message') === 'string'
      )
    })
  )
}

function toApiErrorDetail(value: unknown): ApiErrorDetail {
  if (isApiErrorResponse(value) && value.errors.length > 0) {
    return value.errors[0]
  }

  return FALLBACK_ERROR
}

export { AuthApiError }

export async function createAuthSession(request: LoginRequest): Promise<AuthSession> {
  const response = await fetch(buildApiUrl(AUTH_SESSION_PATH), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Request-Id':
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `request-${Date.now()}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    let errorBody: unknown = null

    try {
      errorBody = await response.json()
    } catch {
      throw new AuthApiError(FALLBACK_ERROR, response.status)
    }

    throw new AuthApiError(toApiErrorDetail(errorBody), response.status)
  }

  const session = (await response.json()) as AuthSession
  saveCsrfToken(session.csrfToken)
  return session
}

export async function deleteCurrentAuthSession(): Promise<void> {
  const csrfToken = getCsrfToken()
  const response = await fetch(buildApiUrl(CURRENT_AUTH_SESSION_PATH), {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      'X-Request-Id':
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `request-${Date.now()}`,
    },
  })

  if (!response.ok) {
    let errorBody: unknown = null

    try {
      errorBody = await response.json()
    } catch {
      throw new AuthApiError(FALLBACK_ERROR, response.status)
    }

    throw new AuthApiError(toApiErrorDetail(errorBody), response.status)
  }

  clearCsrfToken()
}