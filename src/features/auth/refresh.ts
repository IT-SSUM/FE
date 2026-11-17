import axios from 'axios'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from './storage'
import type { ApiResponse, AuthSession } from '@/apis/auth/types'

let pendingRefresh: Promise<AuthSession> | null = null

async function requestNewTokens() {
  const currentSession = getAuthSession()

  if (!currentSession?.refreshToken) {
    clearAuthSession()
    throw new Error('저장된 리프레시 토큰이 없습니다.')
  }

  let refreshedSession: AuthSession

  try {
    const response = await axios.post<ApiResponse<AuthSession>>(
      '/api/auth/tokens/refresh',
      { refreshToken: currentSession.refreshToken },
      {
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: { 'Content-Type': 'application/json' },
      },
    )

    refreshedSession = response.data.data
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined

    const refreshRejected =
      status === 400 ||
      status === 401 ||
      status === 403

    const sessionUnchanged =
      getAuthSession()?.refreshToken ===
      currentSession.refreshToken

    if (refreshRejected && sessionUnchanged) {
      clearAuthSession()
    }

    throw error
  }

  if (
    getAuthSession()?.refreshToken !==
    currentSession.refreshToken
  ) {
    throw new Error(
      '인증 정보가 변경되어 토큰 재발급 결과를 사용하지 않습니다.',
    )
  }

  saveAuthSession(refreshedSession)

  return refreshedSession
}

export function refreshAuthSession() {
  if (!pendingRefresh) {
    pendingRefresh = requestNewTokens().finally(() => {
      pendingRefresh = null
    })
  }

  return pendingRefresh
}