import { useQuery } from '@tanstack/react-query'
import { getMatch } from '@/apis/match'
import { matchKeys } from './useMatchesQuery'
export function useMatchQuery(id: number | null) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    enabled: id !== null,
    queryFn: ({ signal }) => {
      if (id === null) throw new Error('올바른 매칭 번호가 필요합니다.')
      return getMatch(id, signal)
    },
    retry: false,
  })
}
