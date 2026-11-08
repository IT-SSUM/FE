import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptMatch } from '@/apis/match'
import { matchKeys } from '@/hooks/queries/useMatchesQuery'
import type { MatchDetail } from '@/types/match'
export function useAcceptMatchMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: acceptMatch,
    onSuccess: async (result) => {
      const key = matchKeys.detail(result.matchId)
      await client.cancelQueries({ queryKey: key, exact: true })
      // 수락 응답에는 전체 물품 정보가 없으므로 기존 상세에 서버 필드만 병합합니다.
      client.setQueryData<MatchDetail>(key, old => old ? { ...old, ...result } : undefined)
      await Promise.all([
        client.invalidateQueries({ queryKey: matchKeys.lists() }),
        client.invalidateQueries({ queryKey: matchKeys.detail(result.matchId) }),
      ])
    },
  })
}
