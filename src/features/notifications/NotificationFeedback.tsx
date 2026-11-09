import { useNotificationsQuery, useNotificationSettingsQuery } from '@/hooks/queries/useNotificationsQuery'
import { getAuthSession } from '@/features/auth/storage'
import { useReadAllNotificationsMutation, useUpdateNotificationSettingsMutation } from '@/hooks/mutations/useNotificationMutations'
import { useRef } from 'react'

export function NotificationFeedback() {
  const list = useNotificationsQuery()
  const settings = useNotificationSettingsQuery()
  const update = useUpdateNotificationSettingsMutation()
  const readAll = useReadAllNotificationsMutation()
  const locked = useRef(false)
  const toggle = async (field: 'matchEnabled' | 'chatEnabled') => {
    if (!settings.data || locked.current) return
    locked.current = true
    try { await update.mutateAsync({ ...settings.data, [field]: !settings.data[field] }) }
    catch { /* 서버 값을 유지하고 오류를 표시합니다. */ }
    finally { locked.current = false }
  }
  if (!getAuthSession()?.accessToken) return <p role="status">로그인 후 알림을 확인할 수 있어요.</p>
  return (
    <div className="mt-4 space-y-2 typography-body-2 text-neutral-700">
      {settings.data && <p>푸시 수신 설정 · 매칭 {settings.data.matchEnabled ? '켜짐' : '꺼짐'} · 채팅 {settings.data.chatEnabled ? '켜짐' : '꺼짐'}</p>}
      {settings.data && <div className="flex gap-4">
        <label><input type="checkbox" checked={settings.data.matchEnabled} disabled={update.isPending} onChange={() => void toggle('matchEnabled')} /> 매칭 푸시</label>
        <label><input type="checkbox" checked={settings.data.chatEnabled} disabled={update.isPending} onChange={() => void toggle('chatEnabled')} /> 채팅 푸시</label>
      </div>}
      <p>푸시를 꺼도 앱 내 알림은 계속 표시됩니다.</p>
      {update.isError && <p role="alert">설정을 저장하지 못했어요. 다시 시도해주세요.</p>}
      <button type="button" disabled={readAll.isPending} onClick={() => readAll.mutate()}>전체 읽음</button>
      {readAll.isError && <p role="alert">전체 읽음 처리에 실패했어요. 다시 시도해주세요.</p>}
      {settings.isError && <button type="button" onClick={() => void settings.refetch()}>알림 설정 조회 실패 · 재시도</button>}
      {list.isPending && <p role="status">알림을 불러오는 중이에요.</p>}
      {list.isError && <p role="alert">알림을 불러오지 못했어요. <button type="button" onClick={() => void (list.isFetchNextPageError ? list.fetchNextPage() : list.refetch())}>다시 시도</button></p>}
      {list.isSuccess && !list.data.pages.some(page => page.notifications.length) && <p>아직 도착한 알림이 없어요.</p>}
      {list.hasNextPage && <button type="button" disabled={list.isFetching} onClick={() => void list.fetchNextPage()}>{list.isFetchingNextPage ? '불러오는 중…' : '알림 더 보기'}</button>}
    </div>
  )
}
