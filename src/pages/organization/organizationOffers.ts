export type OrganizationOffer = {
  id: string
  direction: 'received' | 'sent'
  donorName: string
  itemSummary: string
  itemName: string
  quantity: string
  availableQuantity: string
  condition: string
  location: string
  status: 'waiting' | 'progress'
  message: string
}

export const organizationOffers: OrganizationOffer[] = [
  {
    id: 'choi-water-10',
    direction: 'received',
    donorName: '최윤서',
    itemSummary: '생수 20개',
    itemName: '생수',
    quantity: '10개',
    availableQuantity: '20개',
    condition: '중 · 사용 상태와 유사',
    location: '경기도 부천시',
    status: 'waiting',
    message: '생수 10개를 기부하고 싶어요. 이번 주 금요일 오후에 전달드려도 괜찮을까요?',
  },
  {
    id: 'kim-books-10',
    direction: 'received',
    donorName: '김하늘',
    itemSummary: '도서 10권',
    itemName: '도서',
    quantity: '10권',
    availableQuantity: '10권',
    condition: '상 · 깨끗함',
    location: '경기도 부천시',
    status: 'progress',
    message: '아동 도서 10권을 기부하고 싶어요.',
  },
  {
    id: 'sent-stationery-10',
    direction: 'sent',
    donorName: '최윤서',
    itemSummary: '학용품 10세트',
    itemName: '학용품',
    quantity: '10세트',
    availableQuantity: '10세트',
    condition: '상 · 미개봉',
    location: '경기도 부천시',
    status: 'waiting',
    message: '이번 주 아동 활동에 사용할 물품이 필요해요.',
  },
]
