import test from 'node:test'
import assert from 'node:assert/strict'
import { filterNeeds, needItems } from '../src/pages/donor/needSearch.ts'

const empty = { query: '', category: '', location: '', condition: '' }

test('검색 조건이 없거나 공백이면 전체 목록을 보여준다', () => {
  assert.deepEqual(filterNeeds(empty), needItems)
  assert.deepEqual(filterNeeds({ ...empty, query: '   ' }), needItems)
})

test('품목과 기관명 검색은 공백과 영문 대소문자를 처리한다', () => {
  assert.deepEqual(filterNeeds({ ...empty, query: ' 생수  a ' }).map((item) => item.id), ['water-20'])
  assert.deepEqual(filterNeeds({ ...empty, query: '기관 c' }).map((item) => item.id), ['books-10'])
})

test('검색과 모든 필터를 동시에 적용한다', () => {
  const filters = { query: '도서', category: '도서·문구', location: '서울 영등포구', condition: '중 이상' }
  assert.deepEqual(filterNeeds(filters).map((item) => item.id), ['books-10'])
  for (const field of ['category', 'location', 'condition']) {
    assert.equal(filterNeeds({ ...filters, [field]: '일치하지 않는 값' }).length, 0)
  }
})

test('일치하지 않는 검색은 빈 결과를 반환하고 초기화하면 전체 복원한다', () => {
  assert.equal(filterNeeds({ ...empty, query: '냉장고' }).length, 0)
  assert.equal(filterNeeds(empty).length, 3)
})
