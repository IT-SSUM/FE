import { useQuery } from '@tanstack/react-query'
import { getMatches } from '@/apis/matches'

export const matchesQueryKey = ['matches'] as const

export function useMatches() {
  return useQuery({
    queryKey: matchesQueryKey,
    queryFn: getMatches,
  })
}
