import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMatchQuantity } from '@/apis/match'
import { matchKeys } from '@/hooks/queries/useMatchesQuery'
import type { MatchDetail } from '@/types/match'
export function useUpdateMatchQuantityMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: updateMatchQuantity,
    onSuccess: async (result) => {
      const key = matchKeys.detail(result.matchId)
      await client.cancelQueries({ queryKey: key, exact: true })
      client.setQueryData<MatchDetail>(key, old => old ? { ...old, ...result } : undefined)
      await Promise.all([
        client.invalidateQueries({ queryKey: matchKeys.lists() }),
        client.invalidateQueries({ queryKey: key }),
      ])
    },
  })
}
