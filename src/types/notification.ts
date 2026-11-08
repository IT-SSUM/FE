export type NotificationItem = {
  notificationId: number
  type: string
  title: string
  content: string
  targetType: string
  targetId: number
  isRead: boolean
  createdAt: string
}

export type NotificationPageResponse = {
  notifications: NotificationItem[]
  nextCursor: number | null
  hasNext: boolean
}

export type NotificationSettings = { matchEnabled: boolean; chatEnabled: boolean }
export type UnreadNotificationCount = { unreadCount: number }

