// API 연결 전 탐색 화면에서 사용하는 샘플 데이터입니다.
export const needItems = [
  { id: 'water-20', title: '생수 20개', organization: '기관 A', location: '서울 구로구', category: '미사용 소모품', condition: '상' },
  { id: 'clothes-10', title: '의류 10벌', organization: '기관 B', location: '서울 관악구', category: '의류·잡화', condition: '중 이상' },
  { id: 'books-10', title: '도서 10권', organization: '기관 C', location: '서울 영등포구', category: '도서·문구', condition: '중 이상' },
] as const

export type NeedSearchFilters = {
  query: string
  category: string
  location: string
  condition: string
}

export const needFilterOptions = {
  category: [...new Set(needItems.map((item) => item.category))],
  location: [...new Set(needItems.map((item) => item.location))],
  condition: [...new Set(needItems.map((item) => item.condition))],
}

export function filterNeeds(filters: NeedSearchFilters) {
  const terms = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return needItems.filter((item) => {
    const searchable = `${item.title} ${item.organization}`.toLocaleLowerCase()
    return terms.every((term) => searchable.includes(term)) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.location || item.location === filters.location) &&
      (!filters.condition || item.condition === filters.condition)
  })
}
