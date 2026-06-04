import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthApiError, deleteCurrentAuthSession } from '@/api/auth'
import { DividendNoticeApiError, fetchDividendNoticeList } from '@/api/dividendNotices'
import type { DividendNoticeList } from '@/types/dividendNotice'

const SYSTEM_ERROR_MESSAGE = '時間をおいて再度お試しください'
const LOGOUT_ERROR_MESSAGE = 'ログアウトに失敗しました'

export function useTopPage() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DividendNoticeList | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)

  useEffect(() => {
    let isActive = true

    const loadDashboard = async (): Promise<void> => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetchDividendNoticeList()

        if (!isActive) {
          return
        }

        setDashboard(response)
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error instanceof DividendNoticeApiError && error.code === 'E_001') {
          navigate('/', { replace: true })
          return
        }

        setErrorMessage(
          error instanceof DividendNoticeApiError ? error.message : SYSTEM_ERROR_MESSAGE,
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isActive = false
    }
  }, [navigate])

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

  const handleOpenNotice = (noticeId: string): void => {
    navigate(`/dividend-notices/${noticeId}`)
  }

  const handleOpenMyPage = (): void => {
    navigate('/my-page')
  }

  return {
    errorMessage,
    handleOpenMyPage,
    handleOpenNotice,
    handleLogout,
    isLoading,
    isLoggingOut,
    loginName: dashboard?.loginName ?? '',
    notices: dashboard?.items ?? [],
    userCode: dashboard?.userCode ?? '',
  }
}