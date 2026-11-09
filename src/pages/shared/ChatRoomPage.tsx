import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, BookOpen, ChevronLeft } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ChatMessage } from '@/apis/chat'
import { ChatBubble } from '@/components/common/ChatBubble/ChatBubble'
import { getAuthSession } from '@/features/auth/storage'
import { useMarkChatReadMutation } from '@/hooks/mutations/useMarkChatReadMutation'
import { useChatMessagesQuery } from '@/hooks/queries/useChatMessagesQuery'
import { useChatRoomsQuery } from '@/hooks/queries/useChatRoomsQuery'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

export function ChatRoomPage() {
  const navigate = useNavigate()
  const { chatRoomId: chatRoomIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const isOrganization = searchParams.get('audience') === 'organization'
  const parsedChatRoomId = Number(chatRoomIdParam)
  const chatRoomId = Number.isSafeInteger(parsedChatRoomId) && parsedChatRoomId > 0
    ? parsedChatRoomId
    : null
  const currentUserId = getAuthSession()?.userId ?? null
  const [message, setMessage] = useState('')
  const lastMarkedReadId = useRef(0)

  const roomsQuery = useChatRoomsQuery()
  const messagesQuery = useChatMessagesQuery(chatRoomId)
  const markReadMutation = useMarkChatReadMutation()
  const room = roomsQuery.data?.find((item) => item.chatRoomId === chatRoomId)
  const messages = useMemo(
    () =>
      messagesQuery.data?.pages
        .flatMap((page) => page.messages)
        .reverse() ?? [],
    [messagesQuery.data],
  )
  const latestMessageId = messages.reduce(
    (latest, chat) => Math.max(latest, chat.messageId),
    0,
  )

  useEffect(() => {
    if (chatRoomId === null || latestMessageId <= lastMarkedReadId.current) return

    lastMarkedReadId.current = latestMessageId
    markReadMutation.mutate(
      { chatRoomId, lastReadMessageId: latestMessageId },
      {
        onError: () => {
          lastMarkedReadId.current = 0
        },
      },
    )
  }, [chatRoomId, latestMessageId, markReadMutation.mutate])

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  if (chatRoomId === null) {
    return <ChatRoomError message="잘못된 채팅방 주소예요." onBack={() => navigate(-1)} />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold leading-6 text-neutral-900">
          {room?.otherName ?? '채팅'}
        </h1>
      </header>

      {room ? (
        <button
          type="button"
          onClick={() => navigate(routePath.tradeDetail(String(room.matchId)))}
          className="flex h-[84px] shrink-0 items-center gap-3 border border-neutral-200 bg-white p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-input bg-error-bg text-primary-700">
            <BookOpen aria-hidden size={28} strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-base font-bold leading-6 text-neutral-900">
              {room.itemName} {room.quantity}{room.unit}
            </strong>
            <span className="mt-1 flex items-center gap-1 text-xs font-medium leading-[18px] text-primary-700">
              {formatMatchStatus(room.matchStatus)} · 거래 상세 보기
              <ArrowRight aria-hidden size={14} strokeWidth={2} />
            </span>
          </span>
        </button>
      ) : null}

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messagesQuery.isPending ? <MessageListSkeleton /> : null}
        {messagesQuery.isError ? (
          <div className="py-16 text-center" role="alert">
            <p className="text-sm text-neutral-700">대화 내역을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void messagesQuery.refetch()}
              className="mt-3 text-sm font-bold text-primary-700"
            >
              다시 시도
            </button>
          </div>
        ) : null}
        {messagesQuery.hasNextPage ? (
          <div className="mb-4 text-center">
            <button
              type="button"
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => void messagesQuery.fetchNextPage()}
              className="text-xs font-semibold text-primary-700 disabled:text-neutral-500"
            >
              {messagesQuery.isFetchingNextPage ? '불러오는 중...' : '이전 메시지 보기'}
            </button>
          </div>
        ) : null}
        {!messagesQuery.isPending && !messagesQuery.isError && messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-700">
            첫 메시지를 보내 대화를 시작해 보세요.
          </p>
        ) : null}
        <section className="space-y-4" aria-label="대화 내역">
          {messages.map((chat, index) => {
            const previous = messages[index - 1]
            const showDate = !previous || !isSameDay(previous.createdAt, chat.createdAt)

            return (
              <div key={chat.messageId}>
                {showDate ? <MessageDate value={chat.createdAt} /> : null}
                <MessageRow
                  chat={chat}
                  isSelf={chat.senderId === currentUserId}
                />
              </div>
            )
          })}
        </section>
      </main>

      <form
        className="flex shrink-0 items-center gap-3 bg-white px-6 py-4"
        onSubmit={sendMessage}
      >
        <label className="sr-only" htmlFor="chat-message">메시지 입력</label>
        <input
          id="chat-message"
          type="text"
          value={message}
          disabled
          onChange={(event) => setMessage(event.target.value)}
          placeholder="실시간 연결 준비 중"
          className="h-11 min-w-0 flex-1 rounded-pill bg-neutral-100 px-3 text-sm font-normal leading-[22px] text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-600 focus:ring-2 focus:ring-primary-700 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled
          className="h-11 w-14 shrink-0 rounded-pill bg-neutral-200 text-sm font-bold leading-5 text-neutral-700"
        >
          전송
        </button>
      </form>
    </div>
  )
}

function MessageRow({ chat, isSelf }: { chat: ChatMessage; isSelf: boolean }) {
  if (chat.messageType === 'SYSTEM') {
    return (
      <div className="mt-4 rounded-card bg-primary-100 p-3 text-center">
        <p className="text-sm font-semibold text-primary-700">{chat.content}</p>
        {chat.systemDescription ? (
          <p className="mt-1 text-xs text-neutral-700">{chat.systemDescription}</p>
        ) : null}
      </div>
    )
  }

  if (chat.messageType === 'APPOINTMENT' && chat.appointment) {
    return (
      <div className="mt-4 rounded-card bg-primary-100 p-3">
        <p className="text-xs font-semibold text-primary-700">{chat.content}</p>
        <p className="mt-1 text-xs text-neutral-700">
          {formatDateTime(chat.appointment.scheduledAt)} · {chat.appointment.deliveryPlace}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('mt-4 flex items-end gap-2', isSelf ? 'justify-end' : 'justify-start')}>
      {!isSelf ? (
        <span className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-pill bg-primary-200 text-primary-700">
          <BookOpen aria-hidden size={18} strokeWidth={2} />
        </span>
      ) : null}
      {isSelf ? <MessageTime value={chat.createdAt} /> : null}
      {chat.messageType === 'IMAGE' ? (
        <img
          src={chat.thumbnailUrl ?? chat.content}
          alt="채팅 이미지"
          className="max-h-64 max-w-[250px] rounded-control object-cover"
        />
      ) : (
        <ChatBubble side={isSelf ? 'self' : 'peer'}>{chat.content}</ChatBubble>
      )}
      {!isSelf ? <MessageTime value={chat.createdAt} /> : null}
    </div>
  )
}

function MessageDate({ value }: { value: string }) {
  const date = new Date(value)
  const text = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(date)

  return <p className="mb-4 text-center text-xs text-neutral-700">{text}</p>
}

function MessageTime({ value }: { value: string }) {
  const date = new Date(value)
  const text = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date)

  return <p className="shrink-0 pb-1 text-xs text-neutral-700">{text}</p>
}

function MessageListSkeleton() {
  return (
    <div className="space-y-5" aria-label="대화 내역 불러오는 중">
      <div className="h-12 w-3/5 animate-pulse rounded-control bg-neutral-100" />
      <div className="ml-auto h-12 w-2/3 animate-pulse rounded-control bg-primary-100" />
      <div className="h-12 w-1/2 animate-pulse rounded-control bg-neutral-100" />
    </div>
  )
}

function ChatRoomError({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-canvas px-6">
      <p className="text-sm text-neutral-700">{message}</p>
      <button type="button" onClick={onBack} className="mt-4 text-sm font-bold text-primary-700">
        돌아가기
      </button>
    </div>
  )
}

function isSameDay(first: string, second: string) {
  const firstDate = new Date(first)
  const secondDate = new Date(second)
  return firstDate.toDateString() === secondDate.toDateString()
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatMatchStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: '대기중',
    TRADING: '거래중',
    RESERVED: '예약중',
    COMPLETED: '거래완료',
    REJECTED: '거절됨',
    CANCELED: '취소됨',
  }
  return labels[status] ?? status
}
