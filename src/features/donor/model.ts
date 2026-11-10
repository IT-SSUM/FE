export const catalog: Record<string, readonly string[]> = {
  '생활용품': ['수건', '침구'], '의류·잡화': ['의류', '가방'], '가구': ['책상', '의자'],
  '주방용품': ['식기', '조리도구'], '도서·문구': ['아동 도서', '학용품'],
  '유아·아동용품': ['장난감', '유아용품'], '미사용 소모품': ['생수', '일회용품'], '기타': ['기타 물품'],
}
export type DonationInput = {
  name: string; category: string; quantity: number; condition: string; location: string
  startDate: string; endDate: string; description: string; photos: string[]
}
export type Donation = DonationInput & {
  id: string; reserved: number; status: 'waiting' | 'progress' | 'complete'
  completedAt?: string; recipient?: string
}
export type Profile = { name: string; birthDate: string; email: string; phone: string; address: string }
export type Selection = { donationId: string; organizationId: string; needId: string; quantity: number }
export type DonorData = { donations: Donation[]; profile: Profile; selections: Record<string, Selection> }
export const unitOf = (name: string) => ({ 수건: '장', 의류: '벌', '아동 도서': '권', 학용품: '세트' }[name] ?? '개')
export const titleOf = (item: Donation) => `${item.name} ${item.quantity}${unitOf(item.name)}`
export const availableQuantity = (item: Donation) => item.status === 'complete' ? 0 : item.quantity - item.reserved
export const canEdit = (item: Donation) => item.status !== 'complete' && item.reserved === 0
export function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
}
export function validateDonation(input: DonationInput, currentDate = today()) {
  const errors: Partial<Record<keyof DonationInput, string>> = {}
  if (!Object.hasOwn(catalog, input.category) || !catalog[input.category]?.includes(input.name)) errors.name = '카테고리에 맞는 품목을 선택해 주세요.'
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 9999) errors.quantity = '수량은 1~9999 사이의 정수로 입력해 주세요.'
  if (!['상', '중', '하'].includes(input.condition)) errors.condition = '상태를 선택해 주세요.'
  if (!input.location.trim()) errors.location = '수령 지역을 입력해 주세요.'
  if (!validDate(input.startDate)) errors.startDate = '수령 시작일을 입력해 주세요.'
  if (!validDate(input.endDate) || input.endDate < input.startDate || input.endDate < currentDate) errors.endDate = '종료일은 시작일 및 오늘 이후로 선택해 주세요.'
  if (input.description.length > 1000) errors.description = '설명은 1000자 이하로 입력해 주세요.'
  if (input.photos.length < 1 || input.photos.length > 5 || input.photos.some((photo) => !/^(data:image\/(png|jpeg|webp);base64,|\/)/.test(photo))) errors.photos = '사진을 1~5장 선택해 주세요.'
  return errors
}
export function validateProfile(profile: Profile) {
  const errors: Partial<Record<keyof Profile, string>> = {}
  if (!profile.name.trim() || profile.name.length > 50) errors.name = '이름을 1~50자로 입력해 주세요.'
  if (!validDate(profile.birthDate) || profile.birthDate > today()) errors.birthDate = '올바른 생년월일을 입력해 주세요.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errors.email = '이메일 형식을 확인해 주세요.'
  if (!/^0\d{8,10}$/.test(profile.phone.replace(/[- ]/g, ''))) errors.phone = '전화번호를 확인해 주세요.'
  if (!profile.address.trim()) errors.address = '주소를 입력해 주세요.'
  return errors
}
export function statsOf(donations: Donation[]) {
  return { total: donations.length, active: donations.filter((item) => item.status !== 'complete').length, complete: donations.filter((item) => item.status === 'complete').length }
}

export function isDonorData(value: unknown): value is DonorData {
  if (!value || typeof value !== 'object') return false
  const data = value as DonorData
  if (!data.profile || !['name', 'birthDate', 'email', 'phone', 'address'].every((key) => typeof data.profile[key as keyof Profile] === 'string')) return false
  if (!Array.isArray(data.donations) || !data.selections || typeof data.selections !== 'object' || Array.isArray(data.selections)) return false
  if (new Set(data.donations.map((item) => item?.id)).size !== data.donations.length) return false
  if (!data.donations.every((item) => item && typeof item.id === 'string' && ['name', 'category', 'condition', 'location', 'startDate', 'endDate', 'description'].every((key) => typeof item[key as keyof Donation] === 'string') && Number.isInteger(item.quantity) && item.quantity > 0 && Number.isInteger(item.reserved) && item.reserved >= 0 && item.reserved <= item.quantity && ['waiting', 'progress', 'complete'].includes(item.status) && Array.isArray(item.photos) && item.photos.every((photo) => typeof photo === 'string' && /^(data:image\/(png|jpeg|webp);base64,|\/)/.test(photo)))) return false
  return Object.entries(data.selections).every(([id, selection]) => selection && selection.donationId === id && typeof selection.organizationId === 'string' && typeof selection.needId === 'string' && Number.isInteger(selection.quantity) && selection.quantity > 0 && data.donations.some((item) => item.id === id && availableQuantity(item) >= selection.quantity))
}

export function saveDonation(data: DonorData, input: DonationInput, id: string, editing: boolean): DonorData {
  if (Object.keys(validateDonation(input)).length) throw new Error('입력 내용을 확인해 주세요.')
  const previous = data.donations.find((item) => item.id === id)
  if (editing && (!previous || !canEdit(previous))) throw new Error('예약 중이거나 완료된 물품은 수정할 수 없습니다.')
  if (!editing && previous) throw new Error('이미 등록된 물품입니다.')
  const item: Donation = { ...input, id, reserved: 0, status: 'waiting' }
  const selections = { ...data.selections }
  delete selections[id] // 정보가 바뀌면 최신 조건으로 기관을 다시 선택합니다.
  return { ...data, selections, donations: editing ? data.donations.map((row) => row.id === id ? item : row) : [item, ...data.donations] }
}
export function deleteDonation(data: DonorData, id: string): DonorData {
  const item = data.donations.find((row) => row.id === id)
  if (!item || !canEdit(item)) throw new Error('예약 중이거나 완료된 물품은 삭제할 수 없습니다.')
  const selections = { ...data.selections }
  delete selections[id]
  return { ...data, selections, donations: data.donations.filter((row) => row.id !== id) }
}
