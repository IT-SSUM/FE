export const organizations = [
  { id: 'org-1', rank: 1, name: '구로지역아동센터', address: '서울 구로구 가마산로 12', introduction: '아이들의 방과 후 돌봄과 학습을 지원하는 기관입니다.', reason: '필요한 품목과 상태가 맞고 가까워요.' },
  { id: 'org-2', rank: 2, name: '구로종합사회복지관', address: '서울 구로구 가마산로 12', introduction: '지역 주민의 생활 지원과 복지 서비스를 제공하는 기관입니다.', reason: '필요 품목과 전달 가능한 지역이 일치해요.' },
  { id: 'org-3', rank: 3, name: '서울꿈나무센터', address: '서울 구로구 가마산로 12', introduction: '아동과 청소년의 건강한 성장을 지원하는 기관입니다.', reason: '기관이 요청한 물품 상태와 맞아요.' },
] as const

// 서버 추천 응답으로 교체할 샘플입니다. 완료 물품과 알 수 없는 ID는 추천하지 않습니다.
const donations: Record<string, { title: string; quantity: number; unit: string }> = {
  'mock-donation-1': { title: '어린이 도서', quantity: 30, unit: '권' },
  'books-12': { title: '아동 도서', quantity: 12, unit: '권' },
  'towels-30': { title: '수건', quantity: 20, unit: '장' },
}

export function getRecommendation(donationId: string) {
  return Object.hasOwn(donations, donationId) ? donations[donationId] : undefined
}

// B 담당 매칭 생성에 전달할 입력 계약. 실제 매칭 ID나 거래 상태를 만들지 않습니다.
export type RecipientSelection = {
  donationId: string
  organizationId: string
  needId: string
  quantity: number
}

export function createRecipientSelection(donationId: string, organizationId: string): RecipientSelection | undefined {
  const donation = getRecommendation(donationId)
  if (!donation || !organizations.some((organization) => organization.id === organizationId)) return undefined
  return { donationId, organizationId, needId: `sample-${donationId}-${organizationId}`, quantity: donation.quantity }
}
