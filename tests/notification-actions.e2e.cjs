const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const requests = [], errors = []
    let fail = false, read = false, settings = { matchEnabled: true, chatEnabled: false }
    page.on('pageerror', e => errors.push(e.message))
    await context.addInitScript(() => localStorage.setItem('itssum.auth.session', JSON.stringify({ userId: 1, role: 'DONOR', accessToken: 'test', refreshToken: 'test' })))
    await context.route('**/api/**', async route => {
      const req = route.request(), path = new URL(req.url()).pathname
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PATCH,POST,DELETE,OPTIONS' }
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
      requests.push({ path, method: req.method(), body: req.postDataJSON() })
      if (fail && req.method() === 'PATCH') return route.fulfill({ status: 500, headers, json: { success: false, message: '테스트 실패' } })
      let data = null
      if (path.endsWith('notification-settings')) {
        if (req.method() === 'PATCH') settings = req.postDataJSON()
        data = settings
      } else if (path.endsWith('/read') || path.endsWith('/read-all')) read = true
      else if (path === '/api/notifications/unread-count') data = { unreadCount: read ? 0 : 1 }
      else if (path === '/api/notifications') data = { notifications: [{ notificationId: 10, type: 'CHAT', title: '테스트 채팅 알림', content: '본문', targetType: 'CHAT', targetId: 22, isRead: read, createdAt: '2026-11-10T00:00:00Z' }], nextCursor: null, hasNext: false }
      else if (path.endsWith('/push-registrations')) data = { pushRegistrationId: 88, deviceType: 'ANDROID' }
      return route.fulfill({ headers, json: { success: true, data } })
    })
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180'
    await page.goto(base + '/notifications')
    await page.getByText('1개', { exact: true }).waitFor()
    fail = true
    await page.getByLabel('매칭 푸시', { exact: true }).click()
    await page.getByRole('alert').filter({ hasText: '설정을 저장하지' }).waitFor()
    assert(await page.getByLabel('매칭 푸시', { exact: true }).isChecked())
    await page.getByRole('button', { name: /테스트 채팅 알림/ }).click()
    await page.getByRole('alert').filter({ hasText: '읽음 처리에 실패' }).waitFor()
    assert(page.url().endsWith('/notifications'))
    await page.getByRole('button', { name: '전체 읽음', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: '전체 읽음 처리에 실패' }).waitFor()
    fail = false
    await page.getByLabel('매칭 푸시', { exact: true }).click()
    await page.getByText('푸시 수신 설정 · 매칭 꺼짐 · 채팅 꺼짐').waitFor()
    assert.deepEqual(requests.filter(r => r.path.endsWith('notification-settings') && r.method === 'PATCH').at(-1).body, { matchEnabled: false, chatEnabled: false })
    await page.getByRole('button', { name: /테스트 채팅 알림/ }).click()
    await page.getByText('0개', { exact: true }).waitFor()
    assert(page.url().endsWith('/notifications'))
    assert.equal(requests.filter(r => r.path.endsWith('/10/read')).at(-1).body, null)
    read = false
    await page.reload()
    await page.getByText('1개', { exact: true }).waitFor()
    await page.getByRole('button', { name: '전체 읽음', exact: true }).click()
    await page.getByText('0개', { exact: true }).waitFor()
    assert.equal(requests.filter(r => r.path.endsWith('/read-all')).at(-1).body, null)
    const registration = await page.evaluate(async () => {
      const api = await import('/src/apis/notification.ts')
      const storage = await import('/src/features/notifications/pushRegistrationStorage.ts')
      let invalid = false
      try { await api.registerPush({ fid: '', deviceType: 'ANDROID' }) } catch { invalid = true }
      const result = await api.registerPush({ fid: 'test-firebase-installation-id', deviceType: 'ANDROID' })
      storage.savePushRegistration(1, result.pushRegistrationId)
      const otherAccount = storage.getPushRegistration(2)
      return { result, invalid, otherAccount }
    })
    assert.equal(registration.result.pushRegistrationId, 88)
    assert(registration.invalid)
    assert.equal(registration.otherAccount, null)
    assert.deepEqual(requests.find(r => r.path.endsWith('/push-registrations') && r.method === 'POST').body, { fid: 'test-firebase-installation-id', deviceType: 'ANDROID' })
    await page.goto(base + '/organization/mypage')
    await page.getByRole('button', { name: '로그아웃', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '로그아웃', exact: true }).click()
    await page.waitForURL('**/start')
    const deletionIndex = requests.findIndex(r => r.path.endsWith('/push-registrations/88') && r.method === 'DELETE')
    const logoutIndex = requests.findIndex(r => r.path.endsWith('/logout') && r.method === 'POST')
    assert(deletionIndex >= 0 && logoutIndex > deletionIndex)
    assert.equal(await page.evaluate(() => localStorage.getItem('itssum.push-registration')), null)
    assert.equal(await page.evaluate(() => localStorage.getItem('itssum.auth.session')), null)
    assert.deepEqual(errors, [])
    console.log('PASS: settings/read/read-all success and failure, no-body PATCH, registration payload, account-scoped storage, push removal before logout')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
