import { useQuery } from '@tanstack/react-query'
import { getDonorProfile } from '@/apis/donor'

export const donorProfileQueryKey = ['donor', 'me'] as const

export function useDonorProfileQuery() {
  return useQuery({
    queryKey: donorProfileQueryKey,
    queryFn: getDonorProfile,
    staleTime: 1000 * 60 * 5,
  })
}