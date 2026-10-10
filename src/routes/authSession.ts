export type UserRole = 'DONOR' | 'ORGANIZATION'

const AUTH_TOKEN_KEY = 'it-ssum.access-token'
const USER_ROLE_KEY = 'it-ssum.user-role'

export function getAuthSession() {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY)
  const storedRole = sessionStorage.getItem(USER_ROLE_KEY)
  const role: UserRole | null =
    storedRole === 'DONOR' || storedRole === 'ORGANIZATION'
      ? storedRole
      : null

  return { token, role }
}

export function setAuthSession(token: string, role: UserRole) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  sessionStorage.setItem(USER_ROLE_KEY, role)
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(USER_ROLE_KEY)
}
