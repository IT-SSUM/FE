import { getAuthSession } from '@/features/auth/storage'
import { useNotificationsQuery } from '@/hooks/queries/useNotificationsQuery'
import { routePath } from '@/routes/paths'

export function useNotificationItems() {
  const query = useNotificationsQuery()
  const session = getAuthSession()
  const items = query.data?.pages.flatMap(page => page.notifications) ?? []
  return [...new Map(items.map(item => [item.notificationId, item])).values()].map(item => {
    const validId = Number.isSafeInteger(item.targetId) && item.targetId > 0
    // 실제 채팅 화면 연동 전에는 데모 대화로 이동하지 않습니다.
    const to = validId && item.targetType === 'MATCH'
      ? session?.role === 'DONOR' ? routePath.donorRequestDetail(String(item.targetId))
        : session?.role === 'ORGANIZATION' ? routePath.organizationOfferDetail(String(item.targetId)) : null
      : null
    const date = new Date(item.createdAt)
    return {
      id: item.notificationId, title: item.title, description: item.content,
      unread: !item.isRead, to,
      time: Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    }
  })
}
