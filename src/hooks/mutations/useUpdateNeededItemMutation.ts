import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateNeededItem, uploadNeededItemImage } from '@/apis/neededItem'
import { myNeededItemKeys } from '@/hooks/queries/useMyNeededItemsQuery'
import { neededItemKeys } from '@/hooks/queries/useNeededItemQuery'

type UpdateNeededItemInput = {
  neededItemId: number
  description: string
  receiveAddress: string
  image?: string
  originalImageUrl: string | null
  originalImageKey: string | null
}

export function useUpdateNeededItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      neededItemId,
      description,
      receiveAddress,
      image,
      originalImageUrl,
      originalImageKey,
    }: UpdateNeededItemInput) => {
      const referenceImageKey = !image
        ? ''
        : image === originalImageUrl
          ? (originalImageKey ?? '')
          : await uploadNeededItemImage(image)
      return updateNeededItem(neededItemId, {
        description,
        receiveAddress,
        referenceImageKey,
      })
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(neededItemKeys.detail(item.neededItemId), item)
      await queryClient.invalidateQueries({ queryKey: myNeededItemKeys.all })
      await queryClient.invalidateQueries({ queryKey: ['organization', 'needed-items'] })
    },
  })
}
