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

    onSuccess: (profile) => {
      queryClient.setQueryData(
        donorProfileQueryKey,
        profile,
      )
    },
  })
}