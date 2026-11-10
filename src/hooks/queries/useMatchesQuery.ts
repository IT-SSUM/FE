import { useQuery } from '@tanstack/react-query'
import { getMatches } from '@/apis/match'
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: number | null) => [...matchKeys.all, 'detail', id] as const,
}
export function useMatchesQuery() {
  return useQuery({ queryKey: matchKeys.lists(), queryFn: ({ signal }) => getMatches(signal), retry: false })
}
