export type NotificationMethod = 0 | 1

export interface MemberProfile {
  userCode: string
  userName: string
  userNameKana: string
  birthDate: string
  postalCode: string
  address: string
  phoneNumber: string
  email: string
  shareBalanceAmount: string
  notificationMethod: NotificationMethod
  accountRegistrationInfo: string | null
  editable: boolean
}

export interface UpdateMemberProfileRequest {
  postalCode: string
  address: string
  phoneNumber: string
  email: string
  notificationMethod: NotificationMethod
  accountRegistrationInfo: string
}

export interface UpdateMemberProfileResult {
  updatedAt: string
  message: string
}