import test from 'node:test'
import assert from 'node:assert/strict'
import { createRecipientSelection, getRecommendation } from '../src/pages/donor/recommendations.ts'

test('최종 선택은 물품, 기관, 필요 물품과 남은 수량을 함께 전달한다', () => {
  assert.deepEqual(createRecipientSelection('towels-30', 'org-2'), {
    donationId: 'towels-30', organizationId: 'org-2', needId: 'sample-towels-30-org-2', quantity: 20,
  })
  assert.equal(createRecipientSelection('books-12', 'org-3').quantity, 12)
})

test('완료 물품, 잘못된 물품이나 기관은 선택할 수 없다', () => {
  for (const id of ['water-24', 'stationery-30', 'unknown', 'toString', '__proto__']) {
    assert.equal(getRecommendation(id), undefined)
    assert.equal(createRecipientSelection(id, 'org-1'), undefined)
  }
  assert.equal(createRecipientSelection('books-12', 'unknown'), undefined)
})
