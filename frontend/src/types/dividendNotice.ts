export interface DividendNoticeSummary {
  noticeId: string
  fiscalYear: number
  title: string
  isNew: boolean
  publishedAt: string
}

export interface DividendNoticePagination {
  page: number
  pageSize: number
  totalCount: number
}

export interface DividendNoticeList {
  userCode: string
  loginName: string
  items: DividendNoticeSummary[]
  pagination: DividendNoticePagination
}

export type DividendReceiptStatus = 'UNRECEIVED' | 'RECEIVED'

export interface DividendReceiptMethodOption {
  code: string
  label: string
}

export interface DividendNoticeDetailItem {
  itemName: string
  value: string
  note: string | null
}

export interface DividendNoticeDetail {
  noticeId: string
  title: string
  userCode: string
  loginName: string
  receiptStatus: DividendReceiptStatus
  receiptMethod: string
  receiptMethodOptions: DividendReceiptMethodOption[]
  canUpdateReceiptMethod: boolean
  receiptMethodChangeDeadline: string | null
  receiptMethodNote: string | null
  detailItems: DividendNoticeDetailItem[]
  precautions: string[]
}

export interface UpdateReceiptMethodRequest {
  receiptMethod: string
}

export interface UpdateReceiptMethodResult {
  noticeId: string
  receiptStatus: DividendReceiptStatus
  receiptMethod: string
  updatedAt: string
  message: string
}