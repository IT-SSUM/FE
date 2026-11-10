import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  updateDonationItem,
} from '@/apis/donationItem'

import {
  donationItemKeys,
} from '@/hooks/queries/useDonationItemsQuery'

import {
  myDonationItemKeys,
} from '@/hooks/queries/useDonorDonationItemsQuery'

import type {
  UpdateDonationItemRequest,
} from '@/types/donationItem'

export function useUpdateDonationItemMutation() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      donationItemId,
      body,
    }: {
      donationItemId: number
      body: UpdateDonationItemRequest
    }) =>
      updateDonationItem(
        donationItemId,
        body,
      ),

    onSuccess: async (
      item,
      {
        donationItemId,
      },
    ) => {
      const queryKey =
        donationItemKeys.detail(
          donationItemId,
        )

      await queryClient.cancelQueries({
        queryKey,
        exact: true,
      })

      queryClient.setQueryData(
        queryKey,
        item,
      )

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