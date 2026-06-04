export interface ApiErrorDetail {
  code: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  data: null
  errors: ApiErrorDetail[]
}

export class ApiRequestError extends Error {
  readonly code: string
  readonly status: number

  constructor(name: string, detail: ApiErrorDetail, status: number) {
    super(detail.message)
    this.name = name
    this.code = detail.code
    this.status = status
  }
}