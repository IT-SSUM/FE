import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readNotification, readAllNotifications, updateNotificationSettings } from '@/apis/notification'
import { notificationKeys } from '@/hooks/queries/useNotificationsQuery'
import { getAuthSession } from '@/features/auth/storage'

function useReadMutationOptions() {
  const client = useQueryClient()
  const userId = getAuthSession()?.userId ?? null
  return {
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.list(userId) }),
        client.invalidateQueries({ queryKey: notificationKeys.unread(userId) }),
      ])
    },
  }
}

export function useReadNotificationMutation() {
  return useMutation({ mutationFn: readNotification, ...useReadMutationOptions() })
}

export function useReadAllNotificationsMutation() {
  return useMutation({ mutationFn: readAllNotifications, ...useReadMutationOptions() })
}

export function useUpdateNotificationSettingsMutation() {
  const client = useQueryClient()
  const userId = getAuthSession()?.userId ?? null
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: async (data) => {
      const queryKey = notificationKeys.settings(userId)
      await client.cancelQueries({ queryKey })
      client.setQueryData(queryKey, data)
      await client.invalidateQueries({ queryKey })
    },
  })
}
