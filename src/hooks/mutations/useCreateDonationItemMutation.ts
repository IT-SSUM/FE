import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { createDonationItem } from '@/apis/donationItem'
import { donationItemKeys } from '@/hooks/queries/useDonationItemsQuery'

export function useCreateDonationItemMutation() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: createDonationItem,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          donationItemKeys.lists(),
      })
    },
  })
}