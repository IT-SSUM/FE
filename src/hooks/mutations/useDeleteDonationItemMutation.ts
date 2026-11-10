import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  deleteDonationItem,
} from '@/apis/donationItem'

import {
  donationItemKeys,
} from '@/hooks/queries/useDonationItemsQuery'

import {
  myDonationItemKeys,
} from '@/hooks/queries/useDonorDonationItemsQuery'

export function useDeleteDonationItemMutation() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn:
      deleteDonationItem,

    onSuccess: async (
      _,
      donationItemId,
    ) => {
      const queryKey =
        donationItemKeys.detail(
          donationItemId,
        )

      await queryClient.cancelQueries({
        queryKey,
        exact: true,
      })

      queryClient.removeQueries({
        queryKey,
        exact: true,
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            donationItemKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            myDonationItemKeys.all,
        }),
      ])
    },
  })
}