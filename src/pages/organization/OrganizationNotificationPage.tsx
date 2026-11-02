import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

type OrganizationNotification = {
  id: string
  title: string
  description: string
  time: string
  unread?: boolean
  icon: LucideIcon
  to: string
}

const organizationNotifications: OrganizationNotification[] = [
  {
    id: 'new-offer',
    title: '새로운 기부 제안',
    description: '최윤서 님이 생수 10개를 제안했어요.',
    time: '방금',
    unread: true,
    icon: MessageCircle,
    to: routePath.organizationOfferDetail('choi-water-10'),
  },
  {
    id: 'appointment',
    title: '전달 일정이 정해졌어요',
    description: '생수 10개 · 토요일 오후 2시 수령',
    time: '1시간 전',
    icon: CalendarDays,
    to: routePath.organizationActiveTradeDetail('trade-water-hyobi'),
  },
  {
    id: 'delivery-ready',
    title: '전달 준비가 시작됐어요',
    description: '그림책 20권이 전달을 기다려요.',
    time: '어제',
    icon: CheckCircle2,
    to: routePath.organizationActiveTradeDetail('trade-books-kim'),
  },
  {
    id: 'confirm-receipt',
    title: '수령을 확인해 주세요',
    description: '생수 10개를 받았다면 확인해 주세요.',
    time: '어제',
    icon: CheckCircle2,
    to: routePath.organizationNeedDetail('water-20'),
  },
]

export function OrganizationNotificationPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">알림</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        <h2 className="text-xl font-bold leading-7 text-neutral-900">
          물품 지원 소식이 도착했어요
        </h2>

        <section className="mt-4 space-y-3" aria-label="기관 알림 목록">
          {organizationNotifications.map((notification) => {
            const Icon = notification.icon
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => navigate(notification.to)}
                className={cn(
                  'w-full rounded-card border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
                  notification.unread
                    ? 'border-transparent bg-primary-100 hover:bg-primary-200'
                    : 'border-neutral-200 bg-white hover:bg-neutral-100',
                )}
              >
                <span className="flex items-start gap-3">
                  <Icon
                    aria-hidden
                    size={24}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-primary-700"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-semibold leading-[22px] text-neutral-900">
                      {notification.title}
                    </strong>
                    <span className="mt-1 block text-xs font-normal leading-[18px] text-neutral-700">
                      {notification.description}
                    </span>
                    <span className="mt-2 block text-right text-xs font-normal leading-[18px] text-neutral-600">
                      {notification.time}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </section>
      </main>

      <BottomNavigation
        audience="organization"
        activeItem="home"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}
