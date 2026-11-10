import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createDonationItem,
  uploadDonationItemImages,
} from '@/apis/donationItem'

import {
  donationItemKeys,
} from '@/hooks/queries/useDonationItemsQuery'

import {
  myDonationItemKeys,
} from '@/hooks/queries/useDonorDonationItemsQuery'

import type {
  CreateDonationItemInput,
} from '@/types/donationItem'

export function useCreateDonationItemMutation() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: async ({
      images,
      ...request
    }: CreateDonationItemInput) => {
      const imageKeys =
        await uploadDonationItemImages(
          images,
        )

      return createDonationItem({
        ...request,
        imageKeys,
      })
    },

    onSuccess: async () => {
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