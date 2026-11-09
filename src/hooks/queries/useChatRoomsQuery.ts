import { useQuery } from '@tanstack/react-query'
import { getChatRooms } from '@/apis/chat'

export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  messages: (chatRoomId: number) =>
    [...chatKeys.all, 'rooms', chatRoomId, 'messages'] as const,
}

export function useChatRoomsQuery() {
  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: ({ signal }) => getChatRooms(signal),
  })
}
