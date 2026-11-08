import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { logout as requestLogout } from '@/apis/auth'
import { clearAuthSession, getAuthSession } from '@/features/auth/storage'

export function useLogout() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const logoutPending = useRef(false)

  const logout = async () => {
    if (logoutPending.current) return

    logoutPending.current = true
    setIsLoggingOut(true)
    const refreshToken = getAuthSession()?.refreshToken
    try {
      if (refreshToken) await requestLogout(refreshToken)
    } catch {
      // 서버 연결에 실패해도 이 기기의 로그인 정보는 반드시 정리합니다.
    } finally {
      clearAuthSession()
      navigate(ROUTES.start, { replace: true })
      logoutPending.current = false
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
}
