import { useOpenNotification } from '@/features/notifications/useOpenNotification'
import { Bell, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotificationItems } from '@/features/notifications/useNotificationItems'
import { NotificationFeedback } from '@/features/notifications/NotificationFeedback'
import { useUnreadNotificationCountQuery } from '@/hooks/queries/useNotificationsQuery'

export function NotificationPage() {
  const navigate = useNavigate()
  const notificationAction = useOpenNotification()
  const notifications = useNotificationItems()
  const unread = useUnreadNotificationCountQuery()

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
          <p className="mt-1 typography-heading-2 text-primary-700">{unread.data ? unread.data.unreadCount + '개' : '—'}</p>
          {unread.isError && <button type="button" onClick={() => void unread.refetch()}>미읽음 수 조회 재시도</button>}
        </section>

        <section className="mt-4 space-y-3" aria-label="알림 목록">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              disabled={notificationAction.isPending || (!notification.to && !notification.unread)}
              onClick={() => void notificationAction.open(notification)}
              className="flex w-full gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                <Bell aria-hidden size={22} strokeWidth={2} />
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
        {notificationAction.error && <p role="alert">읽음 처리에 실패했어요. 알림을 다시 선택해주세요.</p>}
        <NotificationFeedback />
      </main>
    </div>
  )
}
