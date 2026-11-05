// Run against a local Vite server. All API requests are intercepted; no server data is changed.
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
  const context = await browser.newContext({ timezoneId: 'America/Los_Angeles' })
  const page = await context.newPage()
  const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180'
  const errors = [], requests = []
  page.on('pageerror', error => errors.push(error.message))
  let fail = '', item
  const reset = (status, requestedBy = 'ORGANIZATION') => {
    item = { matchId: 12, donationItemId: 7, neededItemId: 8, donationItemName: '도서', neededItemName: '아동 도서', donorId: 1, organizationId: 2, requestedBy, quantity: 3, initialQuantity: 3, message: '테스트 요청', status, createdAt: '2026-11-06', respondedAt: null, reservedAt: null, completedAt: null, canceledAt: null, cancelReason: null, itemCategoryId: 5, deliveryMethod: 'DIRECT', scheduledAt: '2026-11-10T05:00:00Z', deliveryPlace: '센터 입구', receiverName: '김담당' }
  }
  await context.route('**/api/**', async route => {
    const request = route.request(), method = request.method(), path = new URL(request.url()).pathname
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PATCH,OPTIONS' }
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const body = request.postDataJSON()
    requests.push({ method, path, body })
    const action = path.split('/').at(-1)
    if (method === 'PATCH' && fail === action) return route.fulfill({ status: 409, headers, json: { success: false, code: 'CONFLICT_TEST', message: '서버 처리 실패' } })
    if (method === 'PATCH') {
      if (action === 'reject') item = { ...item, status: 'REJECTED_TEST' }
      if (action === 'quantity') item = { ...item, quantity: body.quantity }
      if (action === 'complete') item = { ...item, status: 'COMPLETED_TEST', completedAt: '2026-11-10' }
      if (action === 'cancel') item = { ...item, status: 'CANCELED_TEST', cancelReason: body.reason }
      if (action === 'appointment') item = { ...item, ...body }
    }
    const data = path === '/api/matches' ? [{ ...item, donorName: '기부자', organizationName: '기관', unit: '권', donationItemRegion: '서울', neededItemRegion: '서울' }] : item
    await route.fulfill({ headers, json: { success: true, data } })
  })
  const go = path => page.goto(base + path)
  const button = name => page.getByRole('button', { name, exact: true })
  try {
    reset('PENDING')
    await go('/donor/requests/12')
    await button('거절하기').click()
    await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click()
    await page.getByText('REJECTED_TEST', { exact: true }).waitFor()
    assert.equal(await button('수락하기').count(), 0)
    reset('PENDING', 'DONOR')
    await go('/donor/requests/12')
    await button('철회하기').waitFor()
    assert.equal(await button('거절하기').count(), 0)
    reset('TRADING')
    await go('/donor/requests/12')
    await button('수량 변경').click()
    await page.getByLabel('변경할 수량').fill('5')
    fail = 'quantity'
    await button('수량 저장').click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.getByLabel('변경할 수량').inputValue(), '5')
    fail = ''
    await button('수량 저장').click()
    await page.getByText('5', { exact: true }).waitFor()
    assert.equal(item.status, 'TRADING')
    assert.equal(await button('전달 완료').count(), 0)
    await button('거래 취소').click()
    assert.equal(await button('취소 확정').isDisabled(), true)
    await page.getByLabel('취소 사유').fill('일정 변경')
    fail = 'cancel'
    await button('취소 확정').click()
    await page.getByRole('alert').waitFor()
    assert.ok(page.url().endsWith('/donor/requests/12'))
    fail = ''
    await button('취소 확정').click()
    await page.waitForURL('**/donor/mypage/requests')
    reset('RESERVED', 'DONOR')
    await go('/organization/trades/12')
    assert.equal(await button('수량 변경').count(), 0)
    await button('전달 완료').click()
    fail = 'complete'
    await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click()
    await page.getByRole('dialog').getByText('서버 처리 실패', { exact: true }).waitFor()
    assert.ok(page.url().endsWith('/organization/trades/12'))
    fail = ''
    await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click()
    await page.waitForURL('**/organization/mypage/offers')
    reset('RESERVED')
    await go('/trades/12/appointment')
    await page.getByLabel('수령인').fill('박담당')
    fail = 'appointment'
    await button('약속 저장').click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.getByLabel('수령인').inputValue(), '박담당')
    fail = ''
    await button('약속 저장').click()
    await page.waitForURL('**/donor/requests/12')
    const appointment = requests.filter(r => r.path.endsWith('/appointment') && r.method === 'PATCH').at(-1)
    assert.deepEqual(appointment.body, { deliveryMethod: 'DIRECT', scheduledAt: '2026-11-10T14:00:00+09:00', deliveryPlace: '센터 입구', receiverName: '박담당' })
    assert.ok(requests.filter(r => /\/(reject|complete)$/.test(r.path)).every(r => r.body === null))
    assert.deepEqual(requests.find(r => r.path.endsWith('/quantity')).body, { quantity: 5 })
    assert.deepEqual(requests.find(r => r.path.endsWith('/cancel')).body, { reason: '일정 변경' })
    reset('COMPLETED_TEST')
    await go('/organization/trades/12')
    await page.getByRole('heading', { name: 'COMPLETED_TEST' }).waitFor()
    assert.equal(await button('전달 완료').count(), 0)
    assert.equal(await button('거래 취소').count(), 0)
    await go('/organization/trades/12/appointment')
    await page.getByText('예약중인 거래에서만 약속을 저장할 수 있어요.', { exact: true }).waitFor()
    assert.equal(await button('약속 저장').isDisabled(), true)
    await go('/organization/trades/12/quantity')
    await page.getByRole('status').waitFor()
    assert.equal(await button('저장').count(), 0)
    assert.deepEqual(errors, [])
    console.log('PASS: five PATCH APIs, permissions, failure stays, server state, KST appointment from non-Korean browser timezone')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
