import { useCallback, useEffect, useRef, useState } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import { type InfiniteData, useQueryClient } from '@tanstack/react-query'
import type {
  ChatMessage,
  ChatMessagePage,
  ChatReadEvent,
  SendChatMessageRequest,
} from '@/apis/chat'
import { getAuthSession } from '@/features/auth/storage'
import { chatKeys } from '@/hooks/queries/useChatRoomsQuery'

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'error'

export function useChatSocket(chatRoomId: number | null) {
  const queryClient = useQueryClient()
  const clientRef = useRef<Client | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    if (chatRoomId === null) return

    const session = getAuthSession()
    if (!session?.accessToken) {
      queueMicrotask(() => setStatus('error'))
      return
    }

    const client = new Client({
      brokerURL: createWebSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
    })

    client.onConnect = () => {
      setStatus('connected')
      client.subscribe(`/topic/chat-rooms/${chatRoomId}`, (frame) => {
        const chat = parseFrame<ChatMessage>(frame)
        if (!chat || chat.chatRoomId !== chatRoomId) return

        queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
          chatKeys.messages(chatRoomId),
          (current) => appendIncomingMessage(current, chat),
        )
        void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() })
      })
      client.subscribe(`/topic/chat-rooms/${chatRoomId}/read`, (frame) => {
        const event = parseFrame<ChatReadEvent>(frame)
        if (
          !event ||
          event.chatRoomId !== chatRoomId ||
          event.readerId === session.userId
        ) {
          return
        }

        queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
          chatKeys.messages(chatRoomId),
          (current) => updateOtherReadPosition(current, event.lastReadMessageId),
        )
      })
    }
    client.onStompError = () => setStatus('error')
    client.onWebSocketError = () => setStatus('error')
    client.onWebSocketClose = () => {
      if (client.active) setStatus('reconnecting')
    }

    clientRef.current = client
    client.activate()

    return () => {
      clientRef.current = null
      void client.deactivate()
    }
  }, [chatRoomId, queryClient])

  const sendMessage = useCallback(
    (request: SendChatMessageRequest) => {
      const client = clientRef.current
      if (!client?.connected || chatRoomId === null) return false

      client.publish({
        destination: `/app/chat-rooms/${chatRoomId}/messages`,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      return true
    },
    [chatRoomId],
  )

  return { status, sendMessage }
}

function createWebSocketUrl() {
  const url = new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/ws'
  url.search = ''
  url.hash = ''
  return url.toString()
}

function parseFrame<T>(frame: IMessage): T | null {
  try {
    const parsed = JSON.parse(frame.body) as T | { data: T }
    return typeof parsed === 'object' && parsed !== null && 'data' in parsed
      ? parsed.data
      : parsed
  } catch {
    return null
  }
}

function appendIncomingMessage(
  current: InfiniteData<ChatMessagePage> | undefined,
  chat: ChatMessage,
) {
  if (!current) return current
  if (current.pages.some((page) => page.messages.some((item) => item.messageId === chat.messageId))) {
    return current
  }

  return {
    ...current,
    pages: current.pages.map((page, index) =>
      index === 0
        ? { ...page, messages: [chat, ...page.messages] }
        : page,
    ),
  }
}

function updateOtherReadPosition(
  current: InfiniteData<ChatMessagePage> | undefined,
  lastReadMessageId: number,
) {
  if (!current) return current
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      otherLastReadMessageId: Math.max(
        page.otherLastReadMessageId ?? 0,
        lastReadMessageId,
      ),
    })),
  }
}
