export type OrganizationTradeStatus = 'progress' | 'complete' | 'canceled'

export type TradeAppointment = {
  date: string
  time: string
  address: string
  detailAddress: string
  method: '직접 전달' | '택배 전달'
}

export const tradeStatusLabels: Record<OrganizationTradeStatus, string> = {
  progress: '진행 중',
  complete: '전달 완료',
  canceled: '거래 취소',
}

export type OrganizationTrade = {
  id: string
  needId: string
  donorName: string
  itemName: string
  category: 'book' | 'package'
  status: OrganizationTradeStatus
  description: string
  badge: string
}

export const organizationTrades: OrganizationTrade[] = [
  {
    id: 'trade-stationery-choi',
    needId: 'stationery-10',
    donorName: '최윤서',
    itemName: '학용품 10세트',
    category: 'book',
    status: 'progress',
    description: '직접 일정 조율 중',
    badge: '거래중',
  },
  {
    id: 'trade-water-hyobi',
    needId: 'water-20',
    donorName: '최효비',
    itemName: '생수 10개',
    category: 'package',
    status: 'progress',
    description: '토요일 오후 2시 직접 전달 예정',
    badge: '예약중',
  },
  {
    id: 'trade-books-kim',
    needId: 'books-10',
    donorName: '김하늘',
    itemName: '도서 10권',
    category: 'package',
    status: 'progress',
    description: '택배 발송 준비 중',
    badge: '예약중',
  },
  {
    id: 'trade-water-choi-complete',
    needId: 'water-20',
    donorName: '최윤서',
    itemName: '생수 20개',
    category: 'package',
    status: 'complete',
    description: '10월 9일 · 수령 완료',
    badge: '전달 완료',
  },
  {
    id: 'trade-books-kim-canceled',
    needId: 'books-10',
    donorName: '김하늘',
    itemName: '도서 5권',
    category: 'package',
    status: 'canceled',
    description: '거래가 취소됐어요',
    badge: '거래 취소',
  },
  {
    id: 'trade-clothes-park-canceled',
    needId: 'clothes-10',
    donorName: '박민수',
    itemName: '의류 3벌',
    category: 'package',
    status: 'canceled',
    description: '거래가 취소됐어요',
    badge: '거래 취소',
  },
]
