import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  recalculateDonationRecommendations,
} from '@/apis/recommendation'

import {
  donationRecommendationKeys,
} from '@/hooks/queries/useDonationRecommendationsQuery'

export function useRecalculateDonationRecommendationsMutation() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      donationItemId: number,
    ) =>
      recalculateDonationRecommendations(
        donationItemId,
      ),

    onSuccess: (
      recommendations,
      donationItemId,
    ) => {
      queryClient.setQueryData(
        donationRecommendationKeys.detail(
          donationItemId,
        ),
        recommendations,
      )
    },
  })
}