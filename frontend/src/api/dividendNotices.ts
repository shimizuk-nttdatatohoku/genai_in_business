import { ApiRequestError, type ApiErrorDetail, type ApiErrorResponse } from '@/types/api'
import { getCsrfToken } from '@/api/csrf'
import type {
  DividendNoticeDetail,
  DividendNoticeList,
  UpdateReceiptMethodRequest,
  UpdateReceiptMethodResult,
} from '@/types/dividendNotice'

const DIVIDEND_NOTICE_PATH = '/api/v1/dividend-notices'

const FALLBACK_ERROR: ApiErrorDetail = {
  code: 'E_901',
  message: '時間をおいて再度お試しください',
}

interface DividendNoticeListResponse {
  success: true
  data: DividendNoticeList
  errors: []
}

interface DividendNoticeDetailResponse {
  success: true
  data: DividendNoticeDetail
  errors: []
}

interface UpdateReceiptMethodResponse {
  success: true
  data: UpdateReceiptMethodResult
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

function isDividendNoticeListResponse(value: unknown): value is DividendNoticeListResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const success = Reflect.get(value, 'success')
  const data = Reflect.get(value, 'data')

  if (success !== true || typeof data !== 'object' || data === null) {
    return false
  }

  const items = Reflect.get(data, 'items')
  const pagination = Reflect.get(data, 'pagination')

  return (
    typeof Reflect.get(data, 'userCode') === 'string' &&
    typeof Reflect.get(data, 'loginName') === 'string' &&
    Array.isArray(items) &&
    typeof pagination === 'object' &&
    pagination !== null
  )
}

function toApiErrorDetail(value: unknown): ApiErrorDetail {
  if (isApiErrorResponse(value) && value.errors.length > 0) {
    return value.errors[0]
  }

  return FALLBACK_ERROR
}

export class DividendNoticeApiError extends ApiRequestError {
  constructor(detail: ApiErrorDetail, status: number) {
    super('DividendNoticeApiError', detail, status)
  }
}

export async function fetchDividendNoticeList(
  page = 1,
  pageSize = 20,
): Promise<DividendNoticeList> {
  const requestUrl = new URL(buildApiUrl(DIVIDEND_NOTICE_PATH), window.location.origin)

  requestUrl.searchParams.set('page', String(page))
  requestUrl.searchParams.set('pageSize', String(pageSize))

  const response = await fetch(requestUrl.toString(), {
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
      throw new DividendNoticeApiError(FALLBACK_ERROR, response.status)
    }

    throw new DividendNoticeApiError(toApiErrorDetail(errorBody), response.status)
  }

  const responseBody = (await response.json()) as unknown

  if (!isDividendNoticeListResponse(responseBody)) {
    throw new DividendNoticeApiError(FALLBACK_ERROR, response.status)
  }

  return responseBody.data
}

function isDividendNoticeDetailResponse(value: unknown): value is DividendNoticeDetailResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const success = Reflect.get(value, 'success')
  const data = Reflect.get(value, 'data')

  if (success !== true || typeof data !== 'object' || data === null) {
    return false
  }

  const detailItems = Reflect.get(data, 'detailItems')
  const receiptMethodOptions = Reflect.get(data, 'receiptMethodOptions')
  const precautions = Reflect.get(data, 'precautions')

  return (
    typeof Reflect.get(data, 'noticeId') === 'string' &&
    typeof Reflect.get(data, 'title') === 'string' &&
    typeof Reflect.get(data, 'userCode') === 'string' &&
    typeof Reflect.get(data, 'loginName') === 'string' &&
    typeof Reflect.get(data, 'receiptStatus') === 'string' &&
    typeof Reflect.get(data, 'receiptMethod') === 'string' &&
    typeof Reflect.get(data, 'canUpdateReceiptMethod') === 'boolean' &&
    (typeof Reflect.get(data, 'receiptMethodChangeDeadline') === 'string' ||
      Reflect.get(data, 'receiptMethodChangeDeadline') === null) &&
    (typeof Reflect.get(data, 'receiptMethodNote') === 'string' ||
      Reflect.get(data, 'receiptMethodNote') === null) &&
    Array.isArray(receiptMethodOptions) &&
    receiptMethodOptions.every(
      (option) =>
        typeof option === 'object' &&
        option !== null &&
        typeof Reflect.get(option, 'code') === 'string' &&
        typeof Reflect.get(option, 'label') === 'string',
    ) &&
    Array.isArray(detailItems) &&
    detailItems.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof Reflect.get(item, 'itemName') === 'string' &&
        typeof Reflect.get(item, 'value') === 'string' &&
        (typeof Reflect.get(item, 'note') === 'string' || Reflect.get(item, 'note') === null),
    ) &&
    Array.isArray(precautions) &&
    precautions.every((item) => typeof item === 'string')
  )
}

function isUpdateReceiptMethodResponse(value: unknown): value is UpdateReceiptMethodResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const success = Reflect.get(value, 'success')
  const data = Reflect.get(value, 'data')

  return (
    success === true &&
    typeof data === 'object' &&
    data !== null &&
    typeof Reflect.get(data, 'noticeId') === 'string' &&
    typeof Reflect.get(data, 'receiptStatus') === 'string' &&
    typeof Reflect.get(data, 'receiptMethod') === 'string' &&
    typeof Reflect.get(data, 'updatedAt') === 'string' &&
    typeof Reflect.get(data, 'message') === 'string'
  )
}

export async function fetchDividendNoticeDetail(noticeId: string): Promise<DividendNoticeDetail> {
  const response = await fetch(
    buildApiUrl(`${DIVIDEND_NOTICE_PATH}/${encodeURIComponent(noticeId)}`),
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Request-Id':
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `request-${Date.now()}`,
      },
    },
  )

  if (!response.ok) {
    let errorBody: unknown = null

    try {
      errorBody = await response.json()
    } catch {
      throw new DividendNoticeApiError(FALLBACK_ERROR, response.status)
    }

    throw new DividendNoticeApiError(toApiErrorDetail(errorBody), response.status)
  }

  const responseBody = (await response.json()) as unknown

  if (!isDividendNoticeDetailResponse(responseBody)) {
    throw new DividendNoticeApiError(FALLBACK_ERROR, response.status)
  }

  return responseBody.data
}

export async function updateDividendReceiptMethod(
  noticeId: string,
  request: UpdateReceiptMethodRequest,
): Promise<UpdateReceiptMethodResult> {
  const csrfToken = getCsrfToken()
  const response = await fetch(
    buildApiUrl(`${DIVIDEND_NOTICE_PATH}/${encodeURIComponent(noticeId)}/receipt-method`),
    {
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
    },
  )

  if (!response.ok) {
    let errorBody: unknown = null

    try {
      errorBody = await response.json()
    } catch {
      throw new DividendNoticeApiError(FALLBACK_ERROR, response.status)
    }

    throw new DividendNoticeApiError(toApiErrorDetail(errorBody), response.status)
  }

  const responseBody = (await response.json()) as unknown

  if (!isUpdateReceiptMethodResponse(responseBody)) {
    throw new DividendNoticeApiError(FALLBACK_ERROR, response.status)
  }

  return responseBody.data
}