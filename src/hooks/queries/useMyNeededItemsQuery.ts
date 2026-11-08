import { useQuery } from '@tanstack/react-query'
import { getAllMyNeededItems } from '@/apis/neededItem'

export const myNeededItemKeys = {
  all: ['organization', 'needed-items'] as const,
}

export function useMyNeededItemsQuery() {
  return useQuery({
    queryKey: myNeededItemKeys.all,
    queryFn: ({ signal }) => getAllMyNeededItems(signal),
    retry: false,
  })
}
