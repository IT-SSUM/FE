import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { logout as requestLogout } from '@/apis/auth'
import { clearAuthSession, getAuthSession } from '@/features/auth/storage'
import { deletePushRegistration } from '@/apis/notification'
import { getPushRegistration, clearPushRegistration } from '@/features/notifications/pushRegistrationStorage'

export function useLogout() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const logoutPending = useRef(false)

  const logout = async () => {
    if (logoutPending.current) return

    logoutPending.current = true
    setIsLoggingOut(true)
    const session = getAuthSession()
    const refreshToken = session?.refreshToken
    const registration = session ? getPushRegistration(session.userId) : null
    if (registration) {
      try {
        await deletePushRegistration(registration.pushRegistrationId)
        clearPushRegistration(registration.userId, registration.pushRegistrationId)
      } catch {
        // 삭제 실패 시 재시도할 수 있도록 등록 ID를 보관하되 로그아웃은 계속합니다.
      }
    }
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
