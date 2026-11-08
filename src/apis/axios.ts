import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { refreshAuthSession } from '@/features/auth/refresh'
import { getAccessToken } from '@/features/auth/storage'

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken && !config.url?.startsWith('/api/auth/')) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryRequestConfig | undefined
    const isAuthRequest = request?.url?.startsWith('/api/auth/')

    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error)
    }

    request._retry = true
    try {
      const session = await refreshAuthSession()
      request.headers.Authorization = `Bearer ${session.accessToken}`
      return axiosInstance(request)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

export default axiosInstance
