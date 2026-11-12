import { useOpenNotification } from '@/features/notifications/useOpenNotification'
import { Bell, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { useNotificationItems } from '@/features/notifications/useNotificationItems'
import { useUnreadNotificationCountQuery } from '@/hooks/queries/useNotificationsQuery'
import { cn } from '@/utils/cn'

export function OrganizationNotificationPage() {
  const navigate = useNavigate()
  const notificationAction = useOpenNotification()
  const organizationNotifications = useNotificationItems()
  const unread = useUnreadNotificationCountQuery()

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
        <p className="mt-2 typography-body-2 text-primary-700">읽지 않은 알림 {unread.data ? unread.data.unreadCount + '개' : '—'}</p>
        {unread.isError && <button type="button" onClick={() => void unread.refetch()}>미읽음 수 조회 재시도</button>}

        <section className="mt-4 space-y-3" aria-label="기관 알림 목록">
          {organizationNotifications.map((notification) => {
            const Icon = Bell
            return (
              <button
                key={notification.id}
                type="button"
                disabled={notificationAction.isPending || (!notification.to && !notification.unread)}
                onClick={() => void notificationAction.open(notification)}
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
        {notificationAction.error && <p role="alert">읽음 처리에 실패했어요. 알림을 다시 선택해주세요.</p>}
      </main>

      <BottomNavigation
        audience="organization"
        activeItem="home"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}
