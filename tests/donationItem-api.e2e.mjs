import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
const context = await browser.newContext()
const page = await context.newPage()
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180'
const errors = []
page.on('pageerror', error => errors.push(error.message))
let item = { donationItemId: 10, status: 'RECRUITING', categoryId: 5, categoryName: '도서·문구', itemName: '어린이 도서', quantity: 30, reservedQuantity: 10, completedQuantity: 0, availableQuantity: 20, unit: '권', conditionGrade: 'MID', description: '원래 설명', regionName: '경기 부천시', imageUrls: [], createdAt: '2026-11-04T14:12:03Z', mine: true, donorId: 1, donorName: '테스트 기부자', donorIntroduction: '소개', pickupAddress: '경기 부천시 길주로 210', pickupAddressDetail: '입구', imageKeys: ['existing-key'] }
let getStatus = 200, patchStatus = 200, deleteStatus = 409
const requests = []
await context.route('**/api/**', async route => {
  const request = route.request()
  const method = request.method()
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,PATCH,DELETE,OPTIONS', 'access-control-allow-headers': '*' }
  if (method === 'OPTIONS') return route.fulfill({ status: 204, headers })
  if (!new URL(request.url()).pathname.endsWith('/donation-items/10')) return route.fulfill({ status: 200, headers, json: { success: true, data: [] } })
  const body = request.postDataJSON()
  requests.push({ method, body })
  let status = method === 'GET' ? getStatus : method === 'PATCH' ? patchStatus : deleteStatus
  if (method === 'PATCH' && status === 200) item = { ...item, ...body }
  if (method === 'DELETE' && status === 200) getStatus = 404
  await route.fulfill({ status, headers, json: status === 200 ? { success: true, data: item } : { success: false, code: `ITEM_${status}`, message: '서버 검증 실패', fieldErrors: status === 400 ? [{ field: 'description', reason: '설명을 확인해주세요' }] : [] } })
})
const go = path => page.goto(base + path)
const see = text => page.getByText(text, { exact: true }).waitFor()
try {
  await go('/donor/donations/10')
  await see('어린이 도서 30권')
  await see('20권')
  await page.getByRole('button', { name: '수정', exact: true }).click()
  await page.getByLabel('카테고리', { exact: true }).waitFor()
  assert.equal(await page.getByLabel('카테고리', { exact: true }).isDisabled(), true)
  assert.equal(await page.locator('input[type=file]').count(), 0)
  await page.getByLabel('상세 설명 (선택)').fill('수정된 설명')
  patchStatus = 400
  await page.getByRole('button', { name: '수정 완료', exact: true }).click()
  await see('설명을 확인해주세요')
  assert.equal(await page.getByLabel('상세 설명 (선택)').inputValue(), '수정된 설명')
  patchStatus = 200
  await page.getByRole('button', { name: '수정 완료', exact: true }).click()
  await page.waitForURL('**/donor/donations/10')
  await see('수정된 설명')
  assert.deepEqual(requests.filter(r => r.method === 'PATCH').map(r => r.body), [{ description: '수정된 설명' }, { description: '수정된 설명' }])
  await page.getByRole('button', { name: '삭제', exact: true }).click()
  await page.getByRole('button', { name: '삭제하기', exact: true }).click()
  await see('응답 대기 중인 제안·요청이나 진행 중인 거래가 있어 삭제할 수 없어요.')
  assert.ok(page.url().endsWith('/donor/donations/10'))
  deleteStatus = 200
  await page.getByRole('button', { name: '삭제', exact: true }).click()
  await page.getByRole('button', { name: '삭제하기', exact: true }).click()
  await page.waitForURL('**/donor/mypage/items')
  await go('/donor/donations/10')
  await see('삭제되었거나 존재하지 않는 물품이에요.')
  for (const status of [401, 403]) {
    getStatus = status
    await go('/donor/donations/10')
    await page.getByRole('alert').waitFor()
    assert.match(await page.getByRole('alert').innerText(), status === 401 ? /로그인/ : /권한/)
  }
  getStatus = 200
  item.mine = false
  await go('/donor/donations/10')
  await see('어린이 도서 30권')
  assert.equal(await page.getByRole('button', { name: '수정', exact: true }).count(), 0)
  assert.equal(await page.getByText(item.pickupAddress, { exact: true }).count(), 0)
  await go('/donor/donations/10/edit')
  await see('등록한 기부자만 수정할 수 있어요')
  const count = requests.length
  await go('/donor/donations/towels-30')
  await see('올바른 서버 물품 번호가 필요해요')
  assert.equal(requests.length, count)
  assert.deepEqual(errors, [])
  console.log('PASS: detail, changed-only PATCH, field errors, cache update, DELETE 409/success, 401/403/404, ownership, invalid ID')
} finally { await browser.close() }
