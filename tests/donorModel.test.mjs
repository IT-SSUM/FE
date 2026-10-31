import test from 'node:test'
import assert from 'node:assert/strict'
import { saveDonation, deleteDonation, validateDonation, validateProfile, statsOf, today } from '../src/features/donor/model.ts'
const input = { name: '수건', category: '생활용품', quantity: 2, condition: '중', location: '서울 구로구', startDate: today(), endDate: '2099-12-31', description: '', photos: ['/sample.png'] }
const empty = () => ({ donations: [], selections: {}, profile: { name: '테스트', birthDate: '2000-01-01', email: 'test@example.com', phone: '010-1234-5678', address: '서울 구로구' } })
test('등록·수정·삭제는 원본을 변경하지 않고 목록과 통계를 반영한다', () => {
  const before = empty()
  const added = saveDonation(before, input, 'new', false)
  assert.equal(before.donations.length, 0)
  assert.deepEqual(statsOf(added.donations), { total: 1, active: 1, complete: 0 })
  added.selections.new = { donationId: 'new', organizationId: 'org-1', needId: 'need-1', quantity: 2 }
  const edited = saveDonation(added, { ...input, quantity: 5 }, 'new', true)
  assert.equal(edited.donations[0].quantity, 5)
  assert.equal(edited.selections.new, undefined)
  assert.equal(deleteDonation(edited, 'new').donations.length, 0)
})
test('예약·완료·없는 물품 수정 및 삭제를 차단한다', () => {
  const state = saveDonation(empty(), input, 'item', false)
  for (const change of [{ reserved: 1 }, { status: 'complete' }]) {
    const blocked = { ...state, donations: [{ ...state.donations[0], ...change }] }
    assert.throws(() => saveDonation(blocked, input, 'item', true))
    assert.throws(() => deleteDonation(blocked, 'item'))
  }
  assert.throws(() => deleteDonation(state, 'unknown'))
  assert.throws(() => saveDonation(state, input, 'unknown', true))
  assert.throws(() => saveDonation(state, input, 'item', false))
})
test('수량·카테고리·날짜·사진 검증', () => {
  assert.deepEqual(validateDonation(input), {})
  for (const quantity of [0, -1, 1.2, 10000, NaN]) assert.ok(validateDonation({ ...input, quantity }).quantity)
  assert.ok(validateDonation({ ...input, category: '가구' }).name)
  assert.ok(validateDonation({ ...input, endDate: '2020-01-01' }).endDate)
  assert.ok(validateDonation({ ...input, startDate: '2026-02-30' }).startDate)
  assert.ok(validateDonation({ ...input, photos: [] }).photos)
  assert.ok(validateDonation({ ...input, photos: ['javascript:alert(1)'] }).photos)
})
test('회원정보의 필수값·이메일·전화·생년월일 검증', () => {
  assert.deepEqual(validateProfile(empty().profile), {})
  const errors = validateProfile({ name: ' ', birthDate: '2099-01-01', email: 'wrong', phone: 'hello', address: '' })
  assert.equal(Object.keys(errors).length, 5)
})
