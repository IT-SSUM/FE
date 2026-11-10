import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getAuthSession } from '@/features/auth/storage'
import { useRegisterPushMutation } from '@/hooks/mutations/useRegisterPushMutation'
import { notificationKeys } from '@/hooks/queries/useNotificationsQuery'
import { WebPushContext } from './WebPushContext'

function subscribeAuth(callback: () => void) {
  window.addEventListener('itssum:auth-changed', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('itssum:auth-changed', callback)
    window.removeEventListener('storage', callback)
  }
}
function authSnapshot() {
  const session = getAuthSession()
  return session?.accessToken ? String(session.userId) : ''
}

export function WebPushProvider({ children }: { children: ReactNode }) {
  const userId = useSyncExternalStore(subscribeAuth, authSnapshot, () => '')
  const client = useQueryClient()
  const { mutateAsync } = useRegisterPushMutation()
  const controller = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const connect = useCallback(async (askPermission: boolean) => {
    if (!userId || controller.current) return
    const operation = new AbortController()
    controller.current = operation
    setBusy(true)
    setMessage('')
    try {
      if (!window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('이 브라우저에서는 웹 푸시를 사용할 수 없어요. HTTPS 환경을 확인해주세요.')
      }
      // 사용자 클릭에서 직접 권한을 요청합니다.
      const permission = askPermission ? await Notification.requestPermission() : Notification.permission
      if (permission !== 'granted') throw new Error('브라우저 사이트 설정에서 알림을 허용해주세요.')
      const { getRegisteredFid } = await import('./webPush')
      const fid = await getRegisteredFid(operation.signal)
      operation.signal.throwIfAborted()
      if (authSnapshot() !== userId) return
      await mutateAsync({ fid, deviceType: 'WEB' })
      if (!operation.signal.aborted && authSnapshot() === userId) setMessage('이 브라우저의 푸시 알림이 연결됐어요.')
    } catch (error) {
      if (!operation.signal.aborted) setMessage(error instanceof Error ? error.message : '푸시 연결에 실패했어요. 다시 시도해주세요.')
    } finally {
      if (controller.current === operation) { controller.current = null; setBusy(false) }
    }
  }, [userId, mutateAsync])

  useEffect(() => {
    let disposed = false
    const subscription = new AbortController()
    let unsubscribe = () => {}
    const stop = () => {
      controller.current?.abort()
      controller.current = null
      setBusy(false)
      setMessage('')
    }
    const refresh = () => {
      if (!disposed && userId && authSnapshot() === userId) {
        void client.invalidateQueries({ queryKey: notificationKeys.list(Number(userId)) })
        void client.invalidateQueries({ queryKey: notificationKeys.unread(Number(userId)) })
      }
    }
    const workerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ISSUM_NOTIFICATION_RECEIVED') refresh()
    }
    window.addEventListener('itssum:push-stop', stop)
    navigator.serviceWorker?.addEventListener('message', workerMessage)
    if (userId && window.isSecureContext && 'Notification' in window) {
      void import('./webPush').then(api => api.subscribeToPushMessages(refresh, subscription.signal))
        .then(off => {
          if (disposed) off()
          else {
            unsubscribe = off
            if (Notification.permission === 'granted') void connect(false)
          }
        })
        .catch(() => { /* 지원하지 않는 환경은 연결 버튼에서 안내합니다. */ })
    }
    return () => {
      disposed = true
      subscription.abort()
      unsubscribe()
      controller.current?.abort()
      controller.current = null
      window.removeEventListener('itssum:push-stop', stop)
      navigator.serviceWorker?.removeEventListener('message', workerMessage)
    }
  }, [userId, client, connect])

  return <WebPushContext.Provider value={{ busy, message, enable: () => connect(true) }}>{children}</WebPushContext.Provider>
}
