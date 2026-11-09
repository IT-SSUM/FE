import { useInfiniteQuery } from '@tanstack/react-query'
import { getChatMessages } from '@/apis/chat'
import { chatKeys } from './useChatRoomsQuery'

export function useChatMessagesQuery(chatRoomId: number | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(chatRoomId ?? 0),
    queryFn: ({ pageParam, signal }) =>
      getChatMessages(
        chatRoomId as number,
        { beforeId: pageParam, size: 30 },
        signal,
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: chatRoomId !== null,
  })
}
