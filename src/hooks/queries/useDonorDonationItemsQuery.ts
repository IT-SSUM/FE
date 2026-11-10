import {
  useQuery,
} from '@tanstack/react-query'

import {
  getMyDonationItems,
} from '@/apis/donationItem'

export const myDonationItemKeys = {
  all: [
    'donor',
    'donation-items',
  ] as const,
}

export function useDonorDonationItemsQuery() {
  return useQuery({
    queryKey:
      myDonationItemKeys.all,

    queryFn: ({
      signal,
    }) =>
      getMyDonationItems(
        signal,
      ),

    staleTime:
      1000 * 60,

    retry: false,
  })
}