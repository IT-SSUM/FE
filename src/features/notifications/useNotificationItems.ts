import {
  getAuthSession,
} from '@/features/auth/storage'

import {
  useNotificationsQuery,
} from '@/hooks/queries/useNotificationsQuery'

import {
  routePath,
} from '@/routes/paths'

function relativeTime(
  value: string,
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  const now =
    new Date()

  const diff =
    now.getTime() -
    date.getTime()

  const seconds =
    Math.floor(
      diff / 1000,
    )

  if (
    seconds <
    60
  ) {
    return '방금'
  }

  const minutes =
    Math.floor(
      seconds / 60,
    )

  if (
    minutes <
    60
  ) {
    return `${minutes}분 전`
  }

  const hours =
    Math.floor(
      minutes / 60,
    )

  if (
    hours <
    24
  ) {
    return `${hours}시간 전`
  }

  const days =
    Math.floor(
      hours / 24,
    )

  if (
    days === 1
  ) {
    return '어제'
  }

  if (
    days <
    7
  ) {
    return `${days}일 전`
  }

  return date.toLocaleDateString(
    'ko-KR',
    {
      timeZone:
        'Asia/Seoul',

      month:
        'numeric',

      day:
        'numeric',
    },
  )
}

export function useNotificationItems() {
  const query =
    useNotificationsQuery()

  const session =
    getAuthSession()

  const items =
    query.data?.pages.flatMap(
      (
        page,
      ) =>
        page.notifications,
    ) ?? []

  return [
    ...new Map(
      items.map(
        (
          item,
        ) => [
          item.notificationId,
          item,
        ],
      ),
    ).values(),
  ].map(
    (
      item,
    ) => {
      const validId =
        Number.isSafeInteger(
          item.targetId,
        ) &&
        item.targetId >
          0

      const to =
        validId &&
        item.targetType ===
          'MATCH'
          ? session?.role ===
            'DONOR'
            ? routePath.donorRequestDetail(
                String(
                  item.targetId,
                ),
              )
            : session?.role ===
                'ORGANIZATION'
              ? routePath.organizationOfferDetail(
                  String(
                    item.targetId,
                  ),
                )
              : null
          : null

      return {
        id:
          item.notificationId,

        type:
          item.type,

        title:
          item.title,

        description:
          item.content,

        unread:
          !item.isRead,

        to,

        time:
          relativeTime(
            item.createdAt,
          ),
      }
    },
  )
}