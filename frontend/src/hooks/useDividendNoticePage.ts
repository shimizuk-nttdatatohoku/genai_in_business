import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AuthApiError, deleteCurrentAuthSession } from '@/api/auth'
import {
  DividendNoticeApiError,
  fetchDividendNoticeDetail,
  updateDividendReceiptMethod,
} from '@/api/dividendNotices'
import type { DividendNoticeDetail } from '@/types/dividendNotice'

const SYSTEM_ERROR_MESSAGE = '時間をおいて再度お試しください'
const LOGOUT_ERROR_MESSAGE = 'ログアウトに失敗しました'
const REQUIRED_MESSAGE = '配当金受取方法を選択してください'
const INVALID_OPTION_MESSAGE = '配当金受取方法を正しく選択してください'

function hasReceiptMethod(detail: DividendNoticeDetail, receiptMethod: string): boolean {
  return detail.receiptMethodOptions.some((option) => option.code === receiptMethod)
}

export function useDividendNoticePage() {
  const navigate = useNavigate()
  const { noticeId } = useParams<{ noticeId: string }>()
  const [detail, setDetail] = useState<DividendNoticeDetail | null>(null)
  const [selectedReceiptMethod, setSelectedReceiptMethod] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrorMessage, setFieldErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)

  useEffect(() => {
    if (!noticeId) {
      navigate('/top', { replace: true })
      return
    }

    let isActive = true

    const loadDetail = async (): Promise<void> => {
      setIsLoading(true)
      setErrorMessage(null)
      setFieldErrorMessage(null)
      setSuccessMessage(null)

      try {
        const response = await fetchDividendNoticeDetail(noticeId)

        if (!isActive) {
          return
        }

        setDetail(response)
        setSelectedReceiptMethod(response.receiptMethod)
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error instanceof DividendNoticeApiError) {
          if (error.code === 'E_001') {
            navigate('/', { replace: true })
            return
          }

          if (error.code === 'E_404') {
            navigate('/top', { replace: true })
            return
          }

          setErrorMessage(error.message)
          return
        }

        setErrorMessage(SYSTEM_ERROR_MESSAGE)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      isActive = false
    }
  }, [navigate, noticeId])

  const handleBack = (): void => {
    navigate('/top')
  }

  const handleReceiptMethodChange = (value: string): void => {
    setSelectedReceiptMethod(value)
    setFieldErrorMessage(null)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!detail) {
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    if (!selectedReceiptMethod) {
      setFieldErrorMessage(REQUIRED_MESSAGE)
      return
    }

    if (!hasReceiptMethod(detail, selectedReceiptMethod)) {
      setFieldErrorMessage(INVALID_OPTION_MESSAGE)
      return
    }

    setFieldErrorMessage(null)
    setIsSubmitting(true)

    try {
      const response = await updateDividendReceiptMethod(detail.noticeId, {
        receiptMethod: selectedReceiptMethod,
      })

      setDetail({
        ...detail,
        receiptMethod: response.receiptMethod,
        receiptStatus: response.receiptStatus,
      })
      setSelectedReceiptMethod(response.receiptMethod)
      setSuccessMessage(response.message)
    } catch (error) {
      if (error instanceof DividendNoticeApiError) {
        if (error.code === 'E_001') {
          navigate('/', { replace: true })
          return
        }

        if (error.code === 'E_404') {
          navigate('/top', { replace: true })
          return
        }

        if (error.code === 'E_101' || error.code === 'E_102') {
          setFieldErrorMessage(error.message)
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

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true)
    setErrorMessage(null)
    setSuccessMessage(null)

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

  const isReceiptReadOnly =
    !detail?.canUpdateReceiptMethod || detail?.receiptStatus === 'RECEIVED' || isLoading

  return {
    detail,
    errorMessage,
    fieldErrorMessage,
    handleBack,
    handleLogout,
    handleReceiptMethodChange,
    handleSubmit,
    isLoading,
    isLoggingOut,
    isReceiptReadOnly,
    isSubmitting,
    isSubmitDisabled: isReceiptReadOnly || isSubmitting || !detail,
    selectedReceiptMethod,
    successMessage,
  }
}