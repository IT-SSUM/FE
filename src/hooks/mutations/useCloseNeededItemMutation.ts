import { useMutation, useQueryClient } from '@tanstack/react-query'
import { closeNeededItem } from '@/apis/neededItem'
import { myNeededItemKeys } from '@/hooks/queries/useMyNeededItemsQuery'
import { neededItemKeys } from '@/hooks/queries/useNeededItemQuery'

export function useCloseNeededItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: closeNeededItem,
    onSuccess: async (item) => {
      queryClient.setQueryData(neededItemKeys.detail(item.neededItemId), item)
      await queryClient.invalidateQueries({ queryKey: myNeededItemKeys.all })
      await queryClient.invalidateQueries({ queryKey: ['organization', 'needed-items'] })
    },
  })
}
