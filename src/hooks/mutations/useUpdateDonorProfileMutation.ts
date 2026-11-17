import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { updateDonorProfile } from '@/apis/donor'
import { donorProfileQueryKey } from '@/hooks/queries/useDonorProfileQuery'

export function useUpdateDonorProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDonorProfile,

    onSuccess: async (profile) => {
      await queryClient.cancelQueries({
        queryKey: donorProfileQueryKey,
      })

      queryClient.setQueryData(
        donorProfileQueryKey,
        profile,
      )
    },
  })
}