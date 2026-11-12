import { BookOpen, ChevronLeft, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ChatRoom } from '@/apis/chat'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { getAuthSession } from '@/features/auth/storage'
import { useChatRoomsQuery } from '@/hooks/queries/useChatRoomsQuery'
import { routePath } from '@/routes/paths'

export function ChatListPage() {
  const navigate = useNavigate()
  const isOrganization = getAuthSession()?.role === 'ORGANIZATION'
  const { data: chatRooms = [], isPending, isError, refetch } =
    useChatRoomsQuery()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold leading-6 text-neutral-900">채팅</h1>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-8 pt-2">
        {isPending ? <ChatListSkeleton /> : null}
        {isError ? <ChatListError onRetry={() => void refetch()} /> : null}
        {!isPending && !isError && chatRooms.length === 0 ? <ChatListEmpty /> : null}
        {!isPending && !isError && chatRooms.length > 0 ? (
          <section className="space-y-4" aria-label="채팅 목록">
            {chatRooms.map((room) => (
              <ChatRoomButton
                key={room.chatRoomId}
                room={room}
                onClick={() =>
                  navigate(routePath.chatRoom(String(room.chatRoomId)))
                }
              />
            ))}
          </section>
        ) : null}
      </main>

      <BottomNavigation
        audience={isOrganization ? 'organization' : 'donor'}
        activeItem="chat"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}

function ChatListEmpty() {
  return (
    <section
      className="flex flex-1 flex-col items-center justify-center px-6 text-center"
      aria-label="채팅 없음"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <MessageCircle aria-hidden size={30} strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 text-base font-bold leading-6 text-neutral-900">
        아직 시작된 채팅이 없어요
      </h2>
      <p className="mt-2 text-sm font-normal leading-[22px] text-neutral-700">
        나눔이 연결되면 상대방과
        <br />
        전달 방법과 일정을 이야기할 수 있어요.
      </p>
    </section>
  )
}

function ChatRoomButton({
  room,
  onClick,
}: {
  room: ChatRoom
  onClick: () => void
}) {
  const blockedStatus = getBlockedChatStatus(room.matchStatus)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[82px] w-full items-center gap-3 rounded-control bg-white py-4 pl-4 pr-2 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary-100 text-primary-700">
        <BookOpen aria-hidden size={24} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-base font-bold leading-6 text-neutral-900">
          {room.otherName}
        </strong>
        <span className="mt-1 block truncate text-sm font-normal leading-[22px] text-neutral-700">
          {room.lastMessageContent ?? '채팅을 시작해 보세요.'}
        </span>
      </span>
      <span className="flex w-14 shrink-0 flex-col items-end gap-2">
        <span className="whitespace-nowrap text-right text-xs font-normal leading-[18px] text-neutral-700">
          {room.lastMessageAt ? formatChatListTime(room.lastMessageAt) : ''}
        </span>
        {blockedStatus ? (
          <span className="whitespace-nowrap rounded-pill bg-neutral-200 px-2 py-0.5 text-xs font-semibold leading-5 text-neutral-700">
            {blockedStatus}
          </span>
        ) : room.unreadCount > 0 ? (
          <span className="flex min-w-5 items-center justify-center rounded-pill bg-primary-700 px-1 text-xs font-bold leading-5 text-white">
            {room.unreadCount > 99 ? '99+' : room.unreadCount}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function getBlockedChatStatus(status: ChatRoom['matchStatus']) {
  switch (status) {
    case 'COMPLETED':
      return '거래 완료'
    case 'CANCELED':
      return '취소됨'
    case 'REJECTED':
      return '거절됨'
    default:
      return null
  }
}

function ChatListSkeleton() {
  return (
    <div className="space-y-4" aria-label="채팅 목록 불러오는 중">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-[82px] animate-pulse rounded-control bg-neutral-100"
        />
      ))}
    </div>
  )
}

function ChatListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-16 text-center" role="alert">
      <p className="text-sm text-neutral-700">채팅 목록을 불러오지 못했어요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 text-sm font-bold text-primary-700"
      >
        다시 시도
      </button>
    </div>
  )
}

function formatChatListTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}
