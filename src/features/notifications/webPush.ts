import { getApps, initializeApp } from 'firebase/app'
import { getMessaging, isSupported, onMessage, onRegistered, register } from 'firebase/messaging'
import { firebaseConfig, firebaseVapidKey } from './firebaseConfig'
import workerUrl from './firebase-messaging-sw.js?worker&url'

async function messaging() {
  if (!window.isSecureContext || !await isSupported()) throw new Error('이 브라우저에서는 웹 푸시를 사용할 수 없어요. HTTPS 환경과 브라우저 설정을 확인해주세요.')
  return getMessaging(getApps().find(app => app.name === 'issum-push') || initializeApp(firebaseConfig, 'issum-push'))
}

export async function subscribeToPushMessages(callback: () => void, signal: AbortSignal) {
  const instance = await messaging()
  signal.throwIfAborted()
  return onMessage(instance, callback)
}

export async function getRegisteredFid(signal: AbortSignal): Promise<string> {
  if (Notification.permission !== 'granted') throw new Error('브라우저 알림 권한이 필요합니다.')
  const instance = await messaging()
  signal.throwIfAborted()
  const worker = await navigator.serviceWorker.register(workerUrl, { type: 'module' })
  // 별도 푸시 전용 scope이므로 navigator.serviceWorker.ready 대신 이 worker의 활성화를 기다립니다.
  if (!worker.active) {
    await new Promise<void>((resolve, reject) => {
      const candidate = worker.installing || worker.waiting
      if (!candidate) return reject(new Error('알림 서비스 워커를 시작하지 못했어요.'))
      const cleanup = () => { clearTimeout(timer); candidate.removeEventListener('statechange', changed); signal.removeEventListener('abort', aborted) }
      const changed = () => {
        if (candidate.state === 'activated') { cleanup(); resolve() }
        else if (candidate.state === 'redundant') { cleanup(); reject(new Error('알림 서비스 워커 설치에 실패했어요.')) }
      }
      const aborted = () => { cleanup(); reject(new Error('푸시 등록이 중단됐어요.')) }
      const timer = setTimeout(() => { cleanup(); reject(new Error('알림 서비스 워커 응답 시간이 초과됐어요.')) }, 20000)
      candidate.addEventListener('statechange', changed)
      signal.addEventListener('abort', aborted, { once: true })
      if (signal.aborted) aborted()
      else changed()
    })
  }
  signal.throwIfAborted()
  return new Promise<string>((resolve, reject) => {
    let unsubscribe = () => {}
    const cleanup = () => { clearTimeout(timer); unsubscribe(); signal.removeEventListener('abort', aborted) }
    const aborted = () => { cleanup(); reject(new Error('푸시 등록이 중단됐어요.')) }
    const timer = setTimeout(() => { cleanup(); reject(new Error('푸시 등록 응답 시간이 초과됐어요. 다시 시도해주세요.')) }, 20000)
    signal.addEventListener('abort', aborted, { once: true })
    unsubscribe = onRegistered(instance, fid => { cleanup(); resolve(fid) })
    void register(instance, { vapidKey: firebaseVapidKey, serviceWorkerRegistration: worker })
      .catch(error => { cleanup(); reject(error) })
  })
}
