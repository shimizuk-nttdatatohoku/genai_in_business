import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { AuthApiError, createAuthSession } from '@/api/auth'

const loginSchema = z.object({
  userCode: z
    .string()
    .trim()
    .min(1, '組合員コードは必須です')
    .regex(/^\d{6,10}$/, '組合員コードは半角数字6桁以上10桁以下で入力してください'),
  password: z
    .string()
    .min(1, 'パスワードは必須です')
    .min(8, 'パスワードは8文字以上32文字以下で入力してください')
    .max(32, 'パスワードは8文字以上32文字以下で入力してください'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const SYSTEM_ERROR_MESSAGE = '時間をおいて再度お試しください'

export function useLoginForm() {
  const navigate = useNavigate()
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      userCode: '',
      password: '',
    },
  })

  const {
    clearErrors,
    formState,
    handleSubmit,
    resetField,
    setError,
    setFocus,
    setValue,
    trigger,
  } = form

  useEffect(() => {
    setFocus('userCode')
  }, [setFocus])

  const clearFormError = (): void => {
    if (formErrorMessage) {
      setFormErrorMessage(null)
    }
  }

  const handleUserCodeBlur = async (event: FocusEvent<HTMLInputElement>): Promise<void> => {
    const trimmedValue = event.target.value.trim()

    setValue('userCode', trimmedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })

    await trigger('userCode')
  }

  const handleUserCodeKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    const isUserCodeValid = await trigger('userCode')

    if (isUserCodeValid) {
      clearErrors('userCode')
      setFocus('password')
    }
  }

  const submitLogin = handleSubmit(async (values) => {
    clearFormError()

    try {
      await createAuthSession({
        userCode: values.userCode,
        password: values.password,
      })

      navigate('/top')
    } catch (error) {
      resetField('password')

      if (error instanceof AuthApiError) {
        if (error.code === 'E_101' || error.code === 'E_102') {
          setError('userCode', { message: error.message })
          setFocus('userCode')
          return
        }

        setFormErrorMessage(error.message)
        setFocus('password')
        return
      }

      setFormErrorMessage(SYSTEM_ERROR_MESSAGE)
      setFocus('password')
    }
  })

  return {
    ...form,
    formErrorMessage,
    isSubmitting: formState.isSubmitting,
    isSubmitDisabled: !formState.isValid || formState.isSubmitting,
    clearFormError,
    handleUserCodeBlur,
    handleUserCodeKeyDown,
    submitLogin,
  }
}