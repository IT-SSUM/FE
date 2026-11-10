import { useQuery } from '@tanstack/react-query'
import { getNeededItem } from '@/apis/neededItem'

export const neededItemKeys = {
  all: ['needed-items'] as const,
  detail: (id: number | null) => [...neededItemKeys.all, 'detail', id] as const,
}

export function useNeededItemQuery(id: number | null) {
  return useQuery({
    queryKey: neededItemKeys.detail(id),
    enabled: id !== null,
    queryFn: ({ signal }) => {
      if (id === null) throw new Error('올바른 필요 물품 번호가 필요해요.')
      return getNeededItem(id, signal)
    },
    retry: false,
  })
}
