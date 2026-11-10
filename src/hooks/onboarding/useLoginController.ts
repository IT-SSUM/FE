import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthErrorMessage, login } from '@/apis/auth'
import { saveAuthSession } from '@/features/auth/storage'
import { ROUTES } from '@/routes/paths'

export function useLoginController() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isFormComplete = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length > 0

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormComplete || isSubmitting) return

    setIsSubmitting(true)
    setError('')
    try {
      const session = await login({ email: email.trim(), password })
      saveAuthSession(session)
      navigate(session.role === 'ORGANIZATION' ? ROUTES.organization.home : ROUTES.donor.home, {
        replace: true,
      })
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError, '로그인하지 못했어요. 이메일과 비밀번호를 확인해 주세요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    email,
    error,
    isFormComplete,
    isSubmitting,
    password,
    setEmail: (value: string) => {
      setEmail(value)
      setError('')
    },
    setPassword: (value: string) => {
      setPassword(value)
      setError('')
    },
    setShowPassword,
    showPassword,
    submit,
  }
}
