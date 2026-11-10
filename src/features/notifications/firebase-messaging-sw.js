import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { firebaseConfig } from './firebaseConfig'

// SDK보다 먼저 등록하여 알림 클릭을 같은 출처의 서비스 진입점으로 한정합니다.
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.stopImmediatePropagation()
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const client = windows.find(window => new URL(window.url).origin === self.location.origin)
    if (client) {
      await client.focus()
      client.postMessage({ type: 'ISSUM_NOTIFICATION_RECEIVED' })
    } else {
      await self.clients.openWindow('/')
    }
  })())
})

const messaging = getMessaging(initializeApp(firebaseConfig))
onBackgroundMessage(messaging, async payload => {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const client of windows) client.postMessage({ type: 'ISSUM_NOTIFICATION_RECEIVED' })
  // notification payload는 SDK가 이미 표시합니다. data-only일 때만 직접 표시합니다.
  if (!payload.notification) {
    await self.registration.showNotification(payload.data?.title || 'IT:SSUM 알림', {
      body: payload.data?.content || payload.data?.body || '새로운 알림이 도착했어요.',
    })
  }
})
