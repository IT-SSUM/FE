import axios from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type { NotificationPageResponse, NotificationSettings, UnreadNotificationCount, RegisterPushRequest, PushRegistration } from '@/types/notification'

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) throw new Error(response.message || '알림 요청에 실패했습니다.')
  return response.data
}

export async function getNotifications(beforeId?: number, size = 30, signal?: AbortSignal) {
  if (!Number.isInteger(size) || size < 1 || size > 100) throw new Error('조회 개수는 1~100이어야 합니다.')
  if (beforeId !== undefined && (!Number.isSafeInteger(beforeId) || beforeId < 1)) throw new Error('유효하지 않은 알림 커서입니다.')
  return unwrap((await axios.get<ApiResponse<NotificationPageResponse>>('/api/notifications', { params: { beforeId, size }, signal })).data)
}

export async function getUnreadNotificationCount(signal?: AbortSignal) {
  return unwrap((await axios.get<ApiResponse<UnreadNotificationCount>>('/api/notifications/unread-count', { signal })).data)
}

export async function getNotificationSettings(signal?: AbortSignal) {
  return unwrap((await axios.get<ApiResponse<NotificationSettings>>('/api/users/me/notification-settings', { signal })).data)
}

export async function deletePushRegistration(pushRegistrationId: number) {
  if (!Number.isSafeInteger(pushRegistrationId) || pushRegistrationId < 1) throw new Error('유효하지 않은 푸시 등록 ID입니다.')
  return unwrap((await axios.delete<ApiResponse<string | null>>(`/api/users/me/push-registrations/${pushRegistrationId}`)).data)
}

export async function updateNotificationSettings(body: NotificationSettings) {
  const { matchEnabled, chatEnabled } = body
  if (typeof matchEnabled !== 'boolean' || typeof chatEnabled !== 'boolean') throw new Error('알림 수신 여부를 확인해주세요.')
  return unwrap((await axios.patch<ApiResponse<NotificationSettings>>('/api/users/me/notification-settings', { matchEnabled, chatEnabled })).data)
}

export async function readNotification(notificationId: number) {
  if (!Number.isSafeInteger(notificationId) || notificationId < 1) throw new Error('유효하지 않은 알림 ID입니다.')
  return unwrap((await axios.patch<ApiResponse<string | null>>(`/api/notifications/${notificationId}/read`)).data)
}

export async function readAllNotifications() {
  return unwrap((await axios.patch<ApiResponse<string | null>>('/api/notifications/read-all')).data)
}

export async function registerPush(body: RegisterPushRequest) {
  const fid = body.fid.trim()
  const deviceType = body.deviceType.trim()
  if (!fid || !deviceType) throw new Error('Firebase 설치 ID와 기기 유형이 필요합니다.')
  return unwrap((await axios.post<ApiResponse<PushRegistration>>('/api/users/me/push-registrations', { fid, deviceType })).data)
}

