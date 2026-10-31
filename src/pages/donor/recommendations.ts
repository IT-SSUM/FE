import { availableQuantity, today, type Donation } from '../../features/donor/model.ts'

export const organizations = [
  { id: 'org-1', rank: 1, name: '구로지역아동센터', address: '서울 구로구 가마산로 12', introduction: '아이들의 방과 후 돌봄과 학습을 지원하는 기관입니다.', reason: '필요한 품목과 상태가 맞고 가까워요.' },
  { id: 'org-2', rank: 2, name: '구로종합사회복지관', address: '서울 구로구 가마산로 12', introduction: '지역 주민의 생활 지원과 복지 서비스를 제공하는 기관입니다.', reason: '필요 품목과 전달 가능한 지역이 일치해요.' },
  { id: 'org-3', rank: 3, name: '서울꿈나무센터', address: '서울 구로구 가마산로 12', introduction: '아동과 청소년의 건강한 성장을 지원하는 기관입니다.', reason: '기관이 요청한 물품 상태와 맞아요.' },
] as const


// 실제 AI 대신 로컬 시연용 후보를 제공합니다.
export function getRecommendation(item: Donation | undefined) {
  if (!item || availableQuantity(item) <= 0 || item.endDate < today()) return undefined
  return { title: item.name, quantity: availableQuantity(item), unit: '개', condition: item.condition }
}
export function recommendationCandidates(item: Donation | undefined) {
  return getRecommendation(item) && item?.condition !== '하' ? organizations : []
}
export type RecipientSelection = { donationId: string; organizationId: string; needId: string; quantity: number }
export function createRecipientSelection(item: Donation | undefined, organizationId: string): RecipientSelection | undefined {
  const donation = getRecommendation(item)
  if (!item || !donation || !recommendationCandidates(item).some((organization) => organization.id === organizationId)) return undefined
  return { donationId: item.id, organizationId, needId: `sample-${item.id}-${organizationId}`, quantity: donation.quantity }
}
