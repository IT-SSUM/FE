import axiosInstance from '@/apis/axios'
import type { ApiResponse, ItemCategory } from './types'

export async function getItemCategories() {
  const response = await axiosInstance.get<ApiResponse<ItemCategory[]>>('/api/item-categories')
  return response.data.data
}
