import { useQuery } from '@tanstack/react-query'
import { getItemConditions } from '@/apis/item'

export const itemConditionQueryKey = ['item-conditions'] as const

export function useItemConditionsQuery() {
  return useQuery({
    queryKey: itemConditionQueryKey,
    queryFn: getItemConditions,
    staleTime: 1000 * 60 * 30,
  })
}