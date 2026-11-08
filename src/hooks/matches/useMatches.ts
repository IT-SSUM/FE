import { useQuery } from '@tanstack/react-query'
import { getMatch, getMatches } from '@/apis/matches'

export const matchesQueryKey = ['matches'] as const

export function useMatches() {
  return useQuery({
    queryKey: matchesQueryKey,
    queryFn: getMatches,
  })
}

export function useMatch(matchId?: number) {
  return useQuery({
    queryKey: [...matchesQueryKey, matchId],
    queryFn: () => getMatch(matchId!),
    enabled: Boolean(matchId),
  })
}
