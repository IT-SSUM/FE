import { useQuery } from '@tanstack/react-query'
import { getItemCategories } from '@/apis/item'

export const itemCategoryQueryKey = ['item-categories'] as const

export function useItemCategoriesQuery() {
  return useQuery({
    queryKey: itemCategoryQueryKey,
    queryFn: getItemCategories,
    staleTime: 1000 * 60 * 30,
  })
}