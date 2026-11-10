const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const requests = [], errors = []
    page.on('pageerror', e => errors.push(e.message))
    await context.addInitScript(() => {
      if (!localStorage.getItem('itssum.auth.session')) localStorage.setItem('itssum.auth.session', JSON.stringify({ userId: 1, role: 'DONOR', accessToken: 'test', refreshToken: 'test' }))
      window.testPermission = 'default'
      window.testSdk = []
      Object.defineProperty(Notification, 'permission', { get: () => window.testPermission })
      Notification.requestPermission = async () => window.testPermission
      navigator.serviceWorker.register = async (url, options) => {
        window.testSdk.push({ action: 'worker', url, options })
        return { active: { state: 'activated' } }
      }
    })
    await context.route('**/firebase_messaging.js*', route => route.fulfill({
      contentType: 'application/javascript',
      body: `let listener;
        export const isSupported = async () => true;
        export const getMessaging = () => ({});
        export const onMessage = (_m, cb) => { window.testReceive = cb; return () => {}; };
        export const onRegistered = (_m, cb) => { window.testSdk.push({action:'listen'}); listener=cb; return () => {listener=null}; };
        export const register = async (_m, options) => {
          window.testSdk.push({action:'register',vapidKey:options.vapidKey});
          if (!listener) throw new Error('onRegistered must run first');
          listener('test-real-sdk-boundary-fid');
        };`,
    }))
    await context.route('**/api/**', async route => {
      const req = route.request(), path = new URL(req.url()).pathname
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS' }
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
      requests.push({ path, method: req.method(), body: req.postDataJSON() })
      let data = null
      if (path.endsWith('/push-registrations')) data = { pushRegistrationId: 91, deviceType: 'WEB' }
      else if (path.endsWith('notification-settings')) data = { matchEnabled: true, chatEnabled: true }
      else if (path.endsWith('unread-count')) data = { unreadCount: 0 }
      else if (path === '/api/notifications') data = { notifications: [], nextCursor: null, hasNext: false }
      await route.fulfill({ headers, json: { success: true, data } })
    })
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180'
    await page.goto(base + '/notifications')
    const button = page.getByRole('button', { name: '이 브라우저에서 푸시 알림 받기' })
    await button.waitFor()
    await page.evaluate(() => { window.testPermission = 'denied' })
    await button.click()
    await page.getByText('브라우저 사이트 설정에서 알림을 허용해주세요.').waitFor()
    assert.equal(requests.filter(r => r.path.endsWith('/push-registrations')).length, 0)
    await page.evaluate(() => { window.testPermission = 'granted' })
    await button.click()
    await page.getByText('이 브라우저의 푸시 알림이 연결됐어요.').waitFor()
    assert.deepEqual(requests.find(r => r.path.endsWith('/push-registrations')).body, { fid: 'test-real-sdk-boundary-fid', deviceType: 'WEB' })
    const sdk = await page.evaluate(() => window.testSdk)
    assert(sdk.findIndex(e => e.action === 'listen') < sdk.findIndex(e => e.action === 'register'))
    assert(sdk.find(e => e.action === 'register').vapidKey.startsWith('BNNpsyv1'))
    assert.equal(sdk.find(e => e.action === 'worker').options.type, 'module')
    const before = requests.filter(r => r.path.endsWith('/unread-count')).length
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/notifications/unread-count')),
      page.evaluate(() => window.testReceive()),
    ])
    assert(requests.filter(r => r.path.endsWith('/unread-count')).length > before)
    // 같은 문서에서 인증 변경 이벤트: 계정 전환 후 허용된 권한으로 자동 재등록.
    await page.evaluate(() => {
      localStorage.setItem('itssum.auth.session', JSON.stringify({ userId: 2, role: 'ORGANIZATION', accessToken: 'test2', refreshToken: 'test2' }))
      window.dispatchEvent(new Event('itssum:auth-changed'))
    })
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('itssum.push-registration')).userId === 2)
    await page.evaluate(() => { history.pushState(null, '', '/organization/mypage'); window.dispatchEvent(new PopStateEvent('popstate')) })
    await page.getByRole('button', { name: '로그아웃', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '로그아웃', exact: true }).click()
    await page.waitForURL('**/start')
    const deleted = requests.findIndex(r => r.method === 'DELETE' && r.path.endsWith('/91'))
    assert(deleted >= 0 && requests.findIndex(r => r.path.endsWith('/logout')) > deleted)
    assert.equal(await page.evaluate(() => localStorage.getItem('itssum.push-registration')), null)
    assert.deepEqual(errors, [])
    console.log('PASS: permission denial/retry, FID listener order, VAPID, WEB registration, foreground invalidation, account re-registration, logout deletion')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
