export type OrganizationNeedStatus = 'recruiting' | 'reserved' | 'complete'

export type OrganizationNeed = {
  id: string
  title: string
  itemName: string
  category: '생활' | '도서' | '의류'
  unit: string
  requiredQuantity: number
  reservedQuantity: number
  receivedQuantity: number
  condition: string
  location: string
  status: OrganizationNeedStatus
  note: string
}

export const organizationNeeds: OrganizationNeed[] = [
  {
    id: 'water-20',
    title: '생수 20개',
    itemName: '생수',
    category: '생활',
    unit: '개',
    requiredQuantity: 20,
    reservedQuantity: 10,
    receivedQuantity: 5,
    condition: '상 · 미개봉',
    location: '경기도 부천시',
    status: 'recruiting',
    note: '추가 5개를 모집할 수 있어요.',
  },
  {
    id: 'books-10',
    title: '도서 10권',
    itemName: '도서',
    category: '도서',
    unit: '권',
    requiredQuantity: 10,
    reservedQuantity: 5,
    receivedQuantity: 5,
    condition: '중 이상',
    location: '경기도 부천시',
    status: 'reserved',
    note: '예약 취소로 잔여 수량이 생기면 모집 재개',
  },
  {
    id: 'clothes-10',
    title: '의류 10벌',
    itemName: '의류',
    category: '의류',
    unit: '벌',
    requiredQuantity: 10,
    reservedQuantity: 0,
    receivedQuantity: 10,
    condition: '중 이상',
    location: '경기도 부천시',
    status: 'complete',
    note: '필요 수량 충족으로 자동 종료',
  },
]

export function additionalQuantity(need: OrganizationNeed) {
  return Math.max(
    need.requiredQuantity - need.reservedQuantity - need.receivedQuantity,
    0,
  )
}
