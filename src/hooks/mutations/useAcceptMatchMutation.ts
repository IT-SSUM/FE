import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptMatch } from '@/apis/match'
import { matchKeys } from '@/hooks/queries/useMatchesQuery'
export function useAcceptMatchMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: acceptMatch,
    onSuccess: async (result) => {
      // 상태 변경 응답은 상세 응답의 일부이므로 전체 상세 캐시로 대체하지 않습니다.
      await Promise.all([
        client.invalidateQueries({ queryKey: matchKeys.lists() }),
        client.invalidateQueries({ queryKey: matchKeys.detail(result.matchId) }),
      ])
    },
  })
}
