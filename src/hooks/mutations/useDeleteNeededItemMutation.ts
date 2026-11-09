import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteNeededItem } from '@/apis/neededItem'
import { myNeededItemKeys } from '@/hooks/queries/useMyNeededItemsQuery'
import { neededItemKeys } from '@/hooks/queries/useNeededItemQuery'

export function useDeleteNeededItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNeededItem,
    onSuccess: async (_, neededItemId) => {
      queryClient.removeQueries({ queryKey: neededItemKeys.detail(neededItemId) })
      await queryClient.invalidateQueries({ queryKey: myNeededItemKeys.all })
      await queryClient.invalidateQueries({ queryKey: ['organization', 'needed-items'] })
    },
  })
}
