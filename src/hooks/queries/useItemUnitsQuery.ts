import { useQuery } from '@tanstack/react-query'
import { getItemUnits } from '@/apis/item'

export const itemUnitQueryKey = ['item-units'] as const

export function useItemUnitsQuery() {
  return useQuery({
    queryKey: itemUnitQueryKey,
    queryFn: getItemUnits,
    staleTime: 1000 * 60 * 30,
  })
}
