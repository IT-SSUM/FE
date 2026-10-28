import { BookOpen, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { routePath } from '@/routes/paths'

const chatRooms = [
  {
    id: 'guro-child-center',
    organization: '구로지역아동센터',
    lastMessage: '네, 금요일 오후 2시에 뵐게요!',
    time: '오후 1:42',
    unreadCount: 2,
  },
  {
    id: 'guro-welfare-center',
    organization: '구로지역아동센터',
    lastMessage: '네, 금요일 오후 2시에 뵐게요!',
    time: '오후 1:42',
    unreadCount: 2,
  },
  {
    id: 'guro-dream-center',
    organization: '구로지역아동센터',
    lastMessage: '네, 금요일 오후 2시에 뵐게요!',
    time: '오후 1:42',
    unreadCount: 2,
  },
  {
    id: 'guro-reserved-center',
    organization: '구로지역아동센터',
    lastMessage: '네, 금요일 오후 2시에 뵐게요!',
    time: '오후 1:42',
  },
  {
    id: 'seoul-dream-center',
    organization: '서울꿈나무센터',
    lastMessage: '책 잘 받았습니다. 감사합니다 :)',
    time: '10월 2일',
  },
]

export function ChatListPage() {
  const navigate = useNavigate()

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
        <h1 className="typography-title-3 text-neutral-900">채팅</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
        <section className="space-y-4" aria-label="채팅 목록">
          {chatRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => navigate(routePath.chatRoom(room.id))}
              className="flex h-[82px] w-full items-center gap-3 rounded-control bg-white py-4 pl-4 pr-2 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary-100 text-primary-700">
                <BookOpen aria-hidden size={24} strokeWidth={2} />
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block truncate typography-title-3 text-neutral-900">
                  {room.organization}
                </strong>
                <span className="mt-1 block truncate typography-body-2 text-neutral-700">
                  {room.lastMessage}
                </span>
              </span>

              <span className="flex w-14 shrink-0 flex-col items-end gap-2">
                <span className="whitespace-nowrap text-right typography-label-2 text-neutral-700">
                  {room.time}
                </span>
                {room.unreadCount ? (
                  <span className="flex size-5 items-center justify-center rounded-pill bg-primary-700 typography-label-2 text-white">
                    {room.unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </section>
      </main>

      <BottomNavigation activeItem="chat" className="sticky bottom-0 shrink-0" />
    </div>
  )
}
