import {
  useQuery,
} from '@tanstack/react-query'

import {
  getDonationRecommendations,
} from '@/apis/recommendation'

export const donationRecommendationKeys = {
  all: [
    'donation-recommendations',
  ] as const,

  detail: (
    donationItemId:
      | number
      | null,
  ) =>
    [
      ...donationRecommendationKeys.all,
      donationItemId,
    ] as const,
}

export function useDonationRecommendationsQuery(
  donationItemId:
    | number
    | null,
  enabled = true,
) {
  return useQuery({
    queryKey:
      donationRecommendationKeys.detail(
        donationItemId,
      ),

    queryFn: ({
      signal,
    }) =>
      getDonationRecommendations(
        donationItemId as number,
        signal,
      ),

    enabled:
      donationItemId !== null &&
      enabled,

    staleTime:
      1000 * 60,
  })
}