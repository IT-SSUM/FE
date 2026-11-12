import {
  ChevronLeft,
  RefreshCw,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  NotificationCard,
} from '@/features/notifications/NotificationCard'

import {
  useNotificationItems,
} from '@/features/notifications/useNotificationItems'

import {
  useOpenNotification,
} from '@/features/notifications/useOpenNotification'

import {
  useNotificationsQuery,
} from '@/hooks/queries/useNotificationsQuery'

export function NotificationPage() {
  const navigate =
    useNavigate()

  const notificationAction =
    useOpenNotification()

  const notifications =
    useNotificationItems()

  const query =
    useNotificationsQuery()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate(-1)
          }
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={24}
            strokeWidth={2}
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          알림
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <h2 className="typography-heading-2 text-neutral-900">
          나눔 소식이 도착했어요
        </h2>

        {query.isPending ? (
          <section
            role="status"
            className="mt-3 rounded-card border border-neutral-200 bg-white px-5 py-10 text-center"
          >
            <p className="typography-body-2 text-neutral-700">
              알림을 불러오고 있어요.
            </p>
          </section>
        ) : null}

        {query.isError ? (
          <section
            role="alert"
            className="mt-3 rounded-card border border-neutral-200 bg-white px-5 py-10 text-center"
          >
            <p className="typography-body-2 text-error">
              알림을 불러오지 못했어요.
            </p>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 typography-label-1 text-primary-700"
              onClick={() =>
                void query.refetch()
              }
            >
              <RefreshCw
                aria-hidden
                size={16}
              />

              다시 시도
            </button>
          </section>
        ) : null}

        {!query.isPending &&
        !query.isError &&
        notifications.length ===
          0 ? (
          <section className="mt-3 rounded-card border border-neutral-200 bg-white px-5 py-10 text-center">
            <p className="typography-title-3 text-neutral-900">
              아직 도착한 알림이 없어요.
            </p>

            <p className="mt-2 typography-body-2 text-neutral-700">
              새로운 나눔 소식이 생기면
              이곳에서 알려드릴게요.
            </p>
          </section>
        ) : null}

        {notifications.length >
        0 ? (
          <section
            className="mt-3 space-y-3"
            aria-label="알림 목록"
          >
            {notifications.map(
              (
                notification,
              ) => (
                <NotificationCard
                  key={
                    notification.id
                  }
                  notification={
                    notification
                  }
                  disabled={
                    notificationAction.isPending
                  }
                  onClick={() =>
                    void notificationAction.open(
                      notification,
                    )
                  }
                />
              ),
            )}
          </section>
        ) : null}

        {notificationAction.error ? (
          <p
            role="alert"
            className="mt-3 typography-label-2 text-error"
          >
            읽음 처리에 실패했어요.
            알림을 다시 선택해 주세요.
          </p>
        ) : null}

        {query.hasNextPage ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              disabled={
                query.isFetchingNextPage
              }
              onClick={() =>
                void query.fetchNextPage()
              }
              className="rounded-control px-4 py-2 typography-label-1 text-primary-700 disabled:text-neutral-500"
            >
              {query.isFetchingNextPage
                ? '불러오는 중...'
                : '알림 더 보기'}
            </button>
          </div>
        ) : null}

        {query.isFetchNextPageError ? (
          <p
            role="alert"
            className="mt-2 text-center typography-label-2 text-error"
          >
            다음 알림을 불러오지
            못했어요.
          </p>
        ) : null}
      </main>

      <BottomNavigation
        audience="donor"
        activeItem="home"
        className="shrink-0"
      />
    </div>
  )
}
