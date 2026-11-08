import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createNeededItem, uploadNeededItemImage } from '@/apis/neededItem'
import type { CreateNeededItemInput } from '@/types/neededItem'

export function useCreateNeededItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ referenceImage, ...request }: CreateNeededItemInput) => {
      const referenceImageKey = referenceImage
        ? await uploadNeededItemImage(referenceImage)
        : undefined
      return createNeededItem({ ...request, referenceImageKey })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['organization', 'needed-items'],
      })
    },
  })
}
