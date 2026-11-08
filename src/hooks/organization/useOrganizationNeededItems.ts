import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getItemCategories } from '@/apis/items'
import { getMyNeededItems } from '@/apis/organization'

export function useItemCategories() {
  return useQuery({
    queryKey: ['item-categories'],
    queryFn: getItemCategories,
    staleTime: 1000 * 60 * 30,
  })
}

export function useOrganizationNeededItems(categoryId?: number) {
  return useInfiniteQuery({
    queryKey: ['organization', 'needed-items', { categoryId }],
    queryFn: ({ pageParam }) => getMyNeededItems({
      categoryId,
      beforeId: pageParam ?? undefined,
      size: 20,
    }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.nextCursor : undefined,
  })
}
