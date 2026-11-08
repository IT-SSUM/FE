import axiosInstance from '@/apis/axios'
import type { ApiResponse, MyNeededItemPage, MyNeededItemParams } from './types'

export async function getMyNeededItems(params: MyNeededItemParams = {}) {
  const response = await axiosInstance.get<ApiResponse<MyNeededItemPage>>(
    '/api/organizations/me/needed-items',
    { params },
  )
  return response.data.data
}
