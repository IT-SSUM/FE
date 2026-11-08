import axios from 'axios'
import { getAccessToken } from '@/features/auth/storage'

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

export default axiosInstance
