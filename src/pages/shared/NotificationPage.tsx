import {
  Bell,
  ChevronLeft,
  MessageCircle,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { routePath } from '@/routes/paths'

const notifications = [
  {
    id: 'match-towels',
    title: '새로운 기관 요청이 도착했어요',
    description: '구로희망복지관이 수건 10장을 신청했어요.',
    time: '방금 전',
    unread: true,
    icon: <Bell aria-hidden size={22} strokeWidth={2} />,
    to: routePath.donorRequestDetail('req-towels-a'),
  },
  {
    id: 'ai-books',
    title: '추천 기관 분석이 완료됐어요',
    description: '아동 도서 12권에 적합한 기관 3곳을 확인해 보세요.',
    time: '오늘 10:40',
    unread: true,
    icon: <Sparkles aria-hidden size={22} strokeWidth={2} />,
    to: routePath.donorRecommendation('books-12'),
  },
  {
    id: 'chat-message',
    title: '채팅 메시지가 도착했어요',
    description: 'A지역아동센터에서 전달 일정을 확인했어요.',
    time: '어제 18:20',
    unread: false,
    icon: <MessageCircle aria-hidden size={22} strokeWidth={2} />,
    to: routePath.chatRoom('mock-need-chat'),
  },
  {
    id: 'complete-water',
    title: '거래가 완료됐어요',
    description: '미개봉 생수 24개 거래 기록이 저장됐어요.',
    time: '10월 8일',
    unread: false,
    icon: <PackageCheck aria-hidden size={22} strokeWidth={2} />,
    to: routePath.donorDonationDetail('water-24'),
  },
]

export function NotificationPage() {
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
        <h1 className="typography-title-3 text-neutral-900">알림</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="rounded-card bg-primary-100 p-4">
          <p className="typography-label-2 text-neutral-700">읽지 않은 알림</p>
          <p className="mt-1 typography-heading-2 text-primary-700">2개</p>
        </section>

        <section className="mt-4 space-y-3" aria-label="알림 목록">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => navigate(notification.to)}
              className="flex w-full gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                {notification.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="typography-title-3 text-neutral-900">
                    {notification.title}
                  </span>
                  {notification.unread ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary-700" />
                  ) : null}
                </span>
                <span className="mt-1 block typography-body-2 text-neutral-700">
                  {notification.description}
                </span>
                <span className="mt-2 block typography-label-2 text-neutral-600">
                  {notification.time}
                </span>
              </span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
