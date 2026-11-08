import axios from 'axios'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  type AuthSession,
} from './storage'

type ApiResponse<T> = {
  data: T
}

let pendingRefresh: Promise<AuthSession> | null = null

async function requestNewTokens() {
  const currentSession = getAuthSession()
  if (!currentSession?.refreshToken) {
    clearAuthSession()
    throw new Error('저장된 리프레시 토큰이 없습니다.')
  }

  try {
    const response = await axios.post<ApiResponse<AuthSession>>(
      '/api/auth/tokens/refresh',
      { refreshToken: currentSession.refreshToken },
      {
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: { 'Content-Type': 'application/json' },
      },
    )
    saveAuthSession(response.data.data)
    return response.data.data
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

export function refreshAuthSession() {
  if (!pendingRefresh) {
    pendingRefresh = requestNewTokens().finally(() => {
      pendingRefresh = null
    })
  }

  return pendingRefresh
}
