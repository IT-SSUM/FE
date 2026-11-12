import { useOpenNotification } from '@/features/notifications/useOpenNotification'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { useNotificationItems } from '@/features/notifications/useNotificationItems'
import { NotificationCard } from '@/features/notifications/NotificationCard'
import { useUnreadNotificationCountQuery } from '@/hooks/queries/useNotificationsQuery'

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
            return (
              <NotificationCard
                key={notification.id}
                notification={notification}
                disabled={notificationAction.isPending || (!notification.to && !notification.unread)}
                onClick={() => void notificationAction.open(notification)}
              />
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
