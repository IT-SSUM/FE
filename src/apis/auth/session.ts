import axiosInstance from '@/apis/axios'
import type { ApiResponse, AuthSession } from './types'

export async function login(request: { email: string; password: string }) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>(
    '/api/auth/login',
    request,
  )
  return response.data.data
}

export async function logout(refreshToken: string) {
  await axiosInstance.post('/api/auth/logout', { refreshToken })
}
