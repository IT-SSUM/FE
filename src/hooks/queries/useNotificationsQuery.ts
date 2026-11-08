import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getNotifications, getNotificationSettings, getUnreadNotificationCount } from '@/apis/notification'
import { getAuthSession } from '@/features/auth/storage'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: number | null) => [...notificationKeys.all, userId, 'list'] as const,
  unread: (userId: number | null) => [...notificationKeys.all, userId, 'unread'] as const,
  settings: (userId: number | null) => [...notificationKeys.all, userId, 'settings'] as const,
}

export function useNotificationsQuery() {
  const session = getAuthSession()
  return useInfiniteQuery({
    queryKey: notificationKeys.list(session?.userId ?? null),
    enabled: !!session?.accessToken,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam, signal }) => getNotifications(pageParam, 30, signal),
    getNextPageParam: (last, _pages, previous, previousParams) => {
      const next = last.nextCursor
      return last.hasNext && next !== null && Number.isSafeInteger(next) && next > 0
        && next !== previous && !previousParams.includes(next) ? next : undefined
    },
  })
}

export function useUnreadNotificationCountQuery() {
  const session = getAuthSession()
  return useQuery({
    queryKey: notificationKeys.unread(session?.userId ?? null),
    enabled: !!session?.accessToken,
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
  })
}

export function useNotificationSettingsQuery() {
  const session = getAuthSession()
  return useQuery({
    queryKey: notificationKeys.settings(session?.userId ?? null),
    enabled: !!session?.accessToken,
    queryFn: ({ signal }) => getNotificationSettings(signal),
  })
}

