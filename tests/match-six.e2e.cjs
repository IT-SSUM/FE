const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
  const context = await browser.newContext()
  const page = await context.newPage()
  const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180'
  const requests = [], errors = []
  page.on('pageerror', e => errors.push(e.message))
  let failure = false, item
  function reset(status, requestedBy) {
    item = { matchId: 12, donationItemId: 7, neededItemId: 8, donationItemName: '도서', neededItemName: '어린이 도서', donorId: 1, organizationId: 2, donorName: '기부자테스트', organizationName: '기관테스트', requestedBy, quantity: 3, initialQuantity: 3, message: '요청 메시지', status, createdAt: '2026-11-08', itemCategoryId: 5, itemCategoryName: '도서·문구', unit: '권', conditionGrade: 'MID', donationItemRegion: '서울', donationItemRemainingQuantity: 20, neededItemRegion: '부천', neededItemAdditionalQuantity: 10, neededItemReceiveAddress: '센터 수령지', organizationAddress: '기관 본사', chatRoomId: 37, deliveryMethod: null, scheduledAt: null, deliveryPlace: null, receiverName: null, respondedAt: null, reservedAt: null, completedAt: null, canceledAt: null, cancelReason: null }
  }
  await context.route('**/api/**', async route => {
    const req = route.request(), method = req.method(), url = new URL(req.url())
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PATCH,OPTIONS' }
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const body = req.postDataJSON(), action = url.pathname.split('/').at(-1)
    requests.push({ method, path: url.pathname, query: url.search, body })
    if (failure && method === 'PATCH') return route.fulfill({ status: 409, headers, json: { success: false, message: '수량 부족', code: 'MATCH_409' } })
    if (method === 'PATCH') {
      if (action === 'quantity') item = { ...item, quantity: body.quantity }
      else item = { ...item, status: action === 'reserve' ? 'RESERVED_SERVER_TEST' : 'CLOSED_SERVER_TEST' }
    }
    await route.fulfill({ headers, json: { success: true, data: url.pathname === '/api/matches' ? [item] : item } })
  })
  const go = path => page.goto(base + path)
  const button = name => page.getByRole('button', { name, exact: true })
  try {
    reset('PENDING', 'DONOR')
    await go('/donor/mypage/requests')
    await page.getByText('기부자테스트 · 기관테스트', { exact: true }).waitFor()
    await go('/donor/requests/12')
    await page.getByText('로그인 역할 확인 후 매칭 작업을 이용할 수 있어요.', { exact: true }).waitFor()
    assert.equal(await button('철회하기').count(), 0)
    await page.getByText('센터 수령지', { exact: true }).waitFor()
    await page.getByText('37', { exact: true }).waitFor()
    // Test-only trusted-role fixture. Production has no Auth provider yet; no localStorage bypass.
    await context.route('**/src/pages/**', async route => {
      const response = await route.fetch()
      const url = route.request().url()
      const role = url.includes('/organization/') ? 'ORGANIZATION' : 'DONOR'
      await route.fulfill({ response, body: (await response.text()).replaceAll('authenticatedRole = null', `authenticatedRole = "${role}"`) })
    })
    await go('/donor/mypage/requests')
    await button('보낸 제안').click()
    await page.getByRole('button').filter({ hasText: '기관테스트' }).click()
    await button('철회하기').click()
    await page.getByText('CLOSED_SERVER_TEST', { exact: true }).waitFor()
    assert.equal(await button('거절하기').count(), 0)
    reset('PENDING', 'ORGANIZATION')
    await go('/donor/requests/12')
    await button('거절하기').click()
    await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click()
    await page.getByText('CLOSED_SERVER_TEST', { exact: true }).waitFor()
    reset('TRADING', 'DONOR')
    await go('/donor/requests/12')
    await button('수량 변경').click()
    await page.getByLabel('변경할 수량').fill('4')
    failure = true
    await button('수량 저장').click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.getByLabel('변경할 수량').inputValue(), '4')
    failure = false
    await button('수량 저장').click()
    await page.getByText('4권', { exact: true }).waitFor()
    assert.equal(item.status, 'TRADING')
    await button('거래 예약하기').click()
    await page.getByText('RESERVED_SERVER_TEST', { exact: true }).waitFor()
    reset('TRADING', 'DONOR')
    await go('/organization/offers/12')
    await page.getByText('기관 본사', { exact: true }).waitFor()
    assert.equal(await button('수량 변경').count(), 0)
    assert.equal(await button('거래 예약하기').count(), 0)
    reset('PENDING', 'DONOR')
    await go('/organization/mypage/offers')
    await button('자세히 보기').click()
    await button('거절하기').waitFor()
    assert.equal(await button('철회하기').count(), 0)
    await page.evaluate(async () => {
      const api = await import('/src/apis/match.ts')
      for (const quantity of [0, -1, 1.5]) {
        let rejected = false
        try { await api.updateMatchQuantity({ matchId: 12, body: { quantity } }) } catch { rejected = true }
        if (!rejected) throw Error('invalid quantity accepted')
      }
    })
    assert.ok(requests.filter(r => /\/(withdraw|reserve|reject)$/.test(r.path)).every(r => r.body === null))
    assert.ok(requests.filter(r => r.path === '/api/matches').every(r => r.query === ''))
    assert.deepEqual(requests.find(r => r.path.endsWith('/quantity')).body, { quantity: 4 })
    assert.deepEqual(errors, [])
    console.log('PASS: six APIs, unknown-role guard, role fixture permissions/direction, server fields/status, payloads, quantity validation')
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
