import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markChatRead } from '@/apis/chat'
import { chatKeys } from '@/hooks/queries/useChatRoomsQuery'

export function useMarkChatReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      chatRoomId,
      lastReadMessageId,
    }: {
      chatRoomId: number
      lastReadMessageId: number
    }) => markChatRead(chatRoomId, { lastReadMessageId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.rooms() })
    },
  })
}
