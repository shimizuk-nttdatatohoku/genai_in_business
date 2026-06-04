import { ApiRequestError, type ApiErrorDetail, type ApiErrorResponse } from '@/types/api'
import { getCsrfToken } from '@/api/csrf'
import type {
  MemberProfile,
  UpdateMemberProfileRequest,
  UpdateMemberProfileResult,
} from '@/types/member'

const USERS_ME_PATH = '/api/v1/users/me'

const FALLBACK_ERROR: ApiErrorDetail = {
  code: 'E_901',
  message: '時間をおいて再度お試しください',
}

interface MemberProfileResponse {
  success: true
  data: MemberProfile
  errors: []
}

interface UpdateMemberProfileResponse {
  success: true
  data: UpdateMemberProfileResult
  errors: []
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

function isMemberProfileResponse(value: unknown): value is MemberProfileResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const success = Reflect.get(value, 'success')
  const data = Reflect.get(value, 'data')

  return (
    success === true &&
    typeof data === 'object' &&
    data !== null &&
    typeof Reflect.get(data, 'userCode') === 'string' &&
    typeof Reflect.get(data, 'userName') === 'string' &&
    typeof Reflect.get(data, 'userNameKana') === 'string' &&
    typeof Reflect.get(data, 'birthDate') === 'string' &&
    typeof Reflect.get(data, 'postalCode') === 'string' &&
    typeof Reflect.get(data, 'address') === 'string' &&
    typeof Reflect.get(data, 'phoneNumber') === 'string' &&
    typeof Reflect.get(data, 'email') === 'string' &&
    typeof Reflect.get(data, 'shareBalanceAmount') === 'string' &&
    typeof Reflect.get(data, 'notificationMethod') === 'number' &&
    (typeof Reflect.get(data, 'accountRegistrationInfo') === 'string' ||
      Reflect.get(data, 'accountRegistrationInfo') === null) &&
    typeof Reflect.get(data, 'editable') === 'boolean'
  )
}

function isUpdateMemberProfileResponse(value: unknown): value is UpdateMemberProfileResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const success = Reflect.get(value, 'success')
  const data = Reflect.get(value, 'data')

  return (
    success === true &&
    typeof data === 'object' &&
    data !== null &&
    typeof Reflect.get(data, 'updatedAt') === 'string' &&
    typeof Reflect.get(data, 'message') === 'string'
  )
}

export class UserApiError extends ApiRequestError {
  constructor(detail: ApiErrorDetail, status: number) {
    super('UserApiError', detail, status)
  }
}

export async function fetchMyProfile(): Promise<MemberProfile> {
  const response = await fetch(buildApiUrl(USERS_ME_PATH), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
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
      throw new UserApiError(FALLBACK_ERROR, response.status)
    }

    throw new UserApiError(toApiErrorDetail(errorBody), response.status)
  }

  const responseBody = (await response.json()) as unknown

  if (!isMemberProfileResponse(responseBody)) {
    throw new UserApiError(FALLBACK_ERROR, response.status)
  }

  return responseBody.data
}

export async function updateMyProfile(
  request: UpdateMemberProfileRequest,
): Promise<UpdateMemberProfileResult> {
  const csrfToken = getCsrfToken()
  const response = await fetch(buildApiUrl(USERS_ME_PATH), {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
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
      throw new UserApiError(FALLBACK_ERROR, response.status)
    }

    throw new UserApiError(toApiErrorDetail(errorBody), response.status)
  }

  const responseBody = (await response.json()) as unknown

  if (!isUpdateMemberProfileResponse(responseBody)) {
    throw new UserApiError(FALLBACK_ERROR, response.status)
  }

  return responseBody.data
}