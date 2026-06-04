import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthApiError, deleteCurrentAuthSession } from '@/api/auth'
import { UserApiError, fetchMyProfile, updateMyProfile } from '@/api/users'
import type { MemberProfile, NotificationMethod, UpdateMemberProfileRequest } from '@/types/member'

const SYSTEM_ERROR_MESSAGE = '時間をおいて再度お試しください'
const FETCH_ERROR_MESSAGE = '組合員情報を表示できません'
const LOGOUT_ERROR_MESSAGE = 'ログアウトに失敗しました'

export interface MyPageFormValues {
  postalCode: string
  address: string
  phoneNumber: string
  email: string
  notificationMethod: NotificationMethod
  accountRegistrationInfo: string
}

type MyPageFieldName = keyof MyPageFormValues

type MyPageFieldErrors = Partial<Record<MyPageFieldName, string>>

function toFormValues(profile: MemberProfile): MyPageFormValues {
  return {
    postalCode: profile.postalCode,
    address: profile.address,
    phoneNumber: profile.phoneNumber,
    email: profile.email,
    notificationMethod: profile.notificationMethod,
    accountRegistrationInfo: profile.accountRegistrationInfo ?? '',
  }
}

function toUpdateRequest(values: MyPageFormValues): UpdateMemberProfileRequest {
  return {
    postalCode: values.postalCode.trim(),
    address: values.address.trim(),
    phoneNumber: values.phoneNumber.trim(),
    email: values.email.trim(),
    notificationMethod: values.notificationMethod,
    accountRegistrationInfo: values.accountRegistrationInfo.trim(),
  }
}

function validateField(fieldName: MyPageFieldName, fieldValue: string | NotificationMethod): string {
  if (fieldName === 'postalCode') {
    const value = String(fieldValue).trim()

    if (!value) {
      return '郵便番号は必須です'
    }

    if (!/^\d{7}$/.test(value)) {
      return '郵便番号は半角数字7桁で入力してください'
    }

    return ''
  }

  if (fieldName === 'address') {
    const value = String(fieldValue).trim()

    if (!value) {
      return '住所は必須です'
    }

    if (value.length > 100) {
      return '住所は100文字以内で入力してください'
    }

    if (/[\r\n]/.test(value)) {
      return '住所は改行せずに入力してください'
    }

    return ''
  }

  if (fieldName === 'phoneNumber') {
    const value = String(fieldValue).trim()
    const digitsOnly = value.replace(/-/g, '')

    if (!value) {
      return '電話番号は必須です'
    }

    if (!/^[0-9-]+$/.test(value) || digitsOnly.length < 10 || digitsOnly.length > 13) {
      return '電話番号の形式が正しくありません'
    }

    return ''
  }

  if (fieldName === 'email') {
    const value = String(fieldValue).trim()

    if (!value) {
      return 'メールアドレスは必須です'
    }

    if (value.length > 254) {
      return 'メールアドレスは254文字以内で入力してください'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'メールアドレスの形式が正しくありません'
    }

    return ''
  }

  if (fieldName === 'notificationMethod') {
    return fieldValue === 0 || fieldValue === 1 ? '' : '通知方法を選択してください'
  }

  const value = String(fieldValue).trim()
  return value.length <= 100 ? '' : '口座登録情報は100文字以内で入力してください'
}

function validateForm(values: MyPageFormValues): MyPageFieldErrors {
  const fieldErrors: MyPageFieldErrors = {}

  const postalCodeError = validateField('postalCode', values.postalCode)
  const addressError = validateField('address', values.address)
  const phoneNumberError = validateField('phoneNumber', values.phoneNumber)
  const emailError = validateField('email', values.email)
  const notificationMethodError = validateField('notificationMethod', values.notificationMethod)
  const accountRegistrationInfoError = validateField(
    'accountRegistrationInfo',
    values.accountRegistrationInfo,
  )

  if (postalCodeError) {
    fieldErrors.postalCode = postalCodeError
  }

  if (addressError) {
    fieldErrors.address = addressError
  }

  if (phoneNumberError) {
    fieldErrors.phoneNumber = phoneNumberError
  }

  if (emailError) {
    fieldErrors.email = emailError
  }

  if (notificationMethodError) {
    fieldErrors.notificationMethod = notificationMethodError
  }

  if (accountRegistrationInfoError) {
    fieldErrors.accountRegistrationInfo = accountRegistrationInfoError
  }

  return fieldErrors
}

export function useMyPage() {
  const navigate = useNavigate()
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null)
  const [formValues, setFormValues] = useState<MyPageFormValues>({
    postalCode: '',
    address: '',
    phoneNumber: '',
    email: '',
    notificationMethod: 1,
    accountRegistrationInfo: '',
  })
  const [fieldErrors, setFieldErrors] = useState<MyPageFieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    let isActive = true

    const loadProfile = async (): Promise<void> => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const profile = await fetchMyProfile()

        if (!isActive) {
          return
        }

        setMemberProfile(profile)
        setFormValues(toFormValues(profile))
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error instanceof UserApiError && error.code === 'E_001') {
          navigate('/', { replace: true })
          return
        }

        setErrorMessage(error instanceof UserApiError ? error.message : FETCH_ERROR_MESSAGE)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isActive = false
    }
  }, [navigate])

  const isSaveDisabled = useMemo(() => {
    return !isEditing || isSubmitting
  }, [isEditing, isSubmitting])

  const handleFieldChange = (
    fieldName: MyPageFieldName,
    fieldValue: string | NotificationMethod,
  ): void => {
    setFormValues((current) => ({
      ...current,
      [fieldName]: fieldValue,
    }))

    setFieldErrors((current) => ({
      ...current,
      [fieldName]: '',
    }))
  }

  const handleFieldBlur = (fieldName: MyPageFieldName): void => {
    setFieldErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, formValues[fieldName]),
    }))
  }

  const handleEdit = (): void => {
    if (!memberProfile?.editable) {
      return
    }

    setFormValues(toFormValues(memberProfile))
    setFieldErrors({})
    setSuccessMessage(null)
    setErrorMessage(null)
    setIsEditing(true)
  }

  const handleCancel = (): void => {
    if (!memberProfile) {
      return
    }

    setFormValues(toFormValues(memberProfile))
    setFieldErrors({})
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsEditing(false)
  }

  const handleBack = (): void => {
    navigate('/top')
  }

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true)
    setErrorMessage(null)

    try {
      await deleteCurrentAuthSession()
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'E_001') {
        navigate('/', { replace: true })
        return
      }

      setErrorMessage(LOGOUT_ERROR_MESSAGE)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const nextFieldErrors = validateForm(formValues)

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const request = toUpdateRequest(formValues)
      const result = await updateMyProfile(request)

      setMemberProfile((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          ...request,
        }
      })

      setFormValues(request)
      setFieldErrors({})
      setSuccessMessage(result.message)
      setIsEditing(false)
    } catch (error) {
      if (error instanceof UserApiError) {
        if (error.code === 'E_001') {
          navigate('/', { replace: true })
          return
        }

        if (error.code === 'E_101' || error.code === 'E_102') {
          const fieldName =
            error.message.includes('郵便番号')
              ? 'postalCode'
              : error.message.includes('電話番号')
                ? 'phoneNumber'
                : error.message.includes('メールアドレス')
                  ? 'email'
                  : undefined

          if (fieldName) {
            setFieldErrors((current) => ({
              ...current,
              [fieldName]: error.message,
            }))
          } else {
            setErrorMessage(error.message)
          }

          return
        }

        setErrorMessage(error.message)
        return
      }

      setErrorMessage(SYSTEM_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    errorMessage,
    fieldErrors,
    formValues,
    handleBack,
    handleCancel,
    handleEdit,
    handleFieldBlur,
    handleFieldChange,
    handleLogout,
    handleSave,
    isEditing,
    isLoading,
    isLoggingOut,
    isSaveDisabled,
    isSubmitting,
    memberProfile,
    successMessage,
  }
}