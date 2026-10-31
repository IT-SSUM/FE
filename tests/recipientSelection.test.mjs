import test from 'node:test'
import assert from 'node:assert/strict'
import { createRecipientSelection, getRecommendation, recommendationCandidates } from '../src/pages/donor/recommendations.ts'
const item = { id: 'new-donation', name: '수건', quantity: 30, reserved: 10, status: 'progress', endDate: '2099-12-31', condition: '중' }
test('동적 물품 ID와 현재 남은 수량으로 선택 데이터를 구성한다', () => {
  assert.deepEqual(createRecipientSelection(item, 'org-2'), {
    donationId: 'new-donation', organizationId: 'org-2', needId: 'sample-new-donation-org-2', quantity: 20,
  })
  assert.equal(createRecipientSelection({ ...item, quantity: 12, reserved: 0 }, 'org-3').quantity, 12)
})
test('삭제·완료·잔량 없음·기간 만료 및 잘못된 기관을 거부한다', () => {
  for (const invalid of [undefined, { ...item, status: 'complete' }, { ...item, reserved: 30 }, { ...item, endDate: '2020-01-01' }]) {
    assert.equal(getRecommendation(invalid), undefined)
    assert.equal(createRecipientSelection(invalid, 'org-1'), undefined)
  }
  assert.equal(createRecipientSelection(item, 'unknown'), undefined)
})
test('상태 조건에 맞지 않는 물품은 빈 추천과 선택 불가를 반환한다', () => {
  assert.equal(recommendationCandidates({ ...item, condition: '하' }).length, 0)
  assert.equal(createRecipientSelection({ ...item, condition: '하' }, 'org-1'), undefined)
})
