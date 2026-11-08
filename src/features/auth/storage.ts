import type { AuthSession } from '@/apis/auth/types'

const AUTH_SESSION_KEY = 'itssum.auth.session'

export function getAuthSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_SESSION_KEY)
    return stored ? JSON.parse(stored) as AuthSession : null
  } catch {
    return null
  }
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
