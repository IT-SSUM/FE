import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getDonationItems } from '@/apis/donationItem'
import type { DonationItemListParams } from '@/types/donationItem'

export const donationItemKeys = {
  all: ['donation-items'] as const,

  details: () => [...donationItemKeys.all, 'detail'] as const,

  detail: (donationItemId: number | null) =>
    [...donationItemKeys.details(), donationItemId] as const,

  lists: () =>
    [...donationItemKeys.all, 'list'] as const,

  list: (
    params: DonationItemListParams,
  ) =>
    [
      ...donationItemKeys.lists(),
      params,
    ] as const,
}

export function useDonationItemsQuery(
  params: DonationItemListParams = {},
) {
  return useQuery({
    queryKey:
      donationItemKeys.list(params),

    queryFn: () =>
      getDonationItems(params),

    staleTime: 1000 * 60,
  })
}

export function useInfiniteDonationItemsQuery(
  params: Omit<DonationItemListParams, 'beforeId'> = {},
) {
  return useInfiniteQuery({
    queryKey: donationItemKeys.list(params),
    queryFn: ({ pageParam }) => getDonationItems({
      ...params,
      beforeId: pageParam ?? undefined,
      size: 20,
    }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.hasNext
      ? lastPage.nextCursor
      : undefined,
  })
}
