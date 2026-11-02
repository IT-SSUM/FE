import axiosInstance from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type { ItemCondition } from '@/types/item'

export async function getItemConditions(): Promise<ItemCondition[]> {
  const response =
    await axiosInstance.get<ApiResponse<ItemCondition[]>>(
      '/api/item-conditions',
    )

  return response.data.data
}