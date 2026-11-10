const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const requests = [], errors = []
    page.on('pageerror', error => errors.push(error.message))
    await context.addInitScript(() => !localStorage.getItem('itssum.auth.session') && localStorage.setItem('itssum.auth.session', JSON.stringify({ userId: 1, role: 'DONOR', accessToken: 'test', refreshToken: 'test' })))
    await context.route('**/api/**', async route => {
      const request = route.request(), url = new URL(request.url())
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,DELETE,OPTIONS' }
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
      requests.push({ path: url.pathname, search: url.search, method: request.method(), auth: request.headers().authorization })
      let data
      if (url.pathname === '/api/notifications') {
        const next = url.searchParams.has('beforeId')
        data = { notifications: [{ notificationId: next ? 9 : 10, title: next ? '이전 알림' : '새 매칭 알림', content: '알림 본문', type: 'MATCH_REQUESTED', targetType: 'MATCH', targetId: 42, isRead: next, createdAt: '2026-11-09T01:00:00Z' }], nextCursor: next ? null : 10, hasNext: !next }
      } else if (url.pathname.endsWith('unread-count')) data = { unreadCount: 7 }
      else if (url.pathname.endsWith('notification-settings')) data = { matchEnabled: true, chatEnabled: false }
      else if (request.method() === 'DELETE') data = null
      else data = {}
      return route.fulfill({ headers, json: { success: true, data } })
    })
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180'
    await page.goto(base + '/notifications')
    await page.getByText('새 매칭 알림', { exact: true }).waitFor()
    await page.getByText('7개', { exact: true }).waitFor()
    await page.getByText('푸시 수신 설정 · 매칭 켜짐 · 채팅 꺼짐').waitFor()
    await page.getByRole('button', { name: '알림 더 보기' }).click()
    await page.getByText('이전 알림', { exact: true }).waitFor()
    assert(requests.some(r => r.search.includes('beforeId=10') && r.search.includes('size=30')))
    const result = await page.evaluate(async () => {
      const api = await import('/src/apis/notification.ts')
      let rejected = false
      try { await api.deletePushRegistration(0) } catch { rejected = true }
      await api.deletePushRegistration(88)
      return rejected
    })
    assert(result)
    assert.equal(requests.filter(r => r.method === 'DELETE').length, 1)
    assert(requests.some(r => r.path.endsWith('/push-registrations/88') && r.auth === 'Bearer test'))
    await page.getByRole('button', { name: /새 매칭 알림/ }).click()
    await page.waitForURL('**/donor/requests/42')
    await page.evaluate(() => localStorage.setItem('itssum.auth.session', JSON.stringify({ userId: 2, role: 'ORGANIZATION', accessToken: 'test', refreshToken: 'test' })))
    await page.goto(base + '/organization/notifications')
    await page.getByText('새 매칭 알림', { exact: true }).waitFor()
    await page.getByRole('button', { name: /새 매칭 알림/ }).click()
    await page.waitForURL('**/organization/offers/42')
    assert.deepEqual(errors, [])
    console.log('PASS: notification queries, pagination, settings, unread count, authenticated delete, invalid ID guard, donor/organization targets')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
