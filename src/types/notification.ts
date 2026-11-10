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

export type RegisterPushRequest = { fid: string; deviceType: string }
export type PushRegistration = { pushRegistrationId: number; deviceType: string }

