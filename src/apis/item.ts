import axiosInstance from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type {
  ItemCategory,
  ItemCondition,
} from '@/types/item'

export async function getItemConditions(): Promise<
  ItemCondition[]
> {
  const response =
    await axiosInstance.get<
      ApiResponse<ItemCondition[]>
    >('/api/item-conditions')

  return response.data.data
}

export async function getItemCategories(): Promise<
  ItemCategory[]
> {
  const response =
    await axiosInstance.get<
      ApiResponse<ItemCategory[]>
    >('/api/item-categories')

  return response.data.data
}