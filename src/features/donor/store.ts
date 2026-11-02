import { create } from 'zustand'
import samplePhoto from '@/assets/images/mascot/box-happy.png'
import { deleteDonation, isDonorData, saveDonation, today, validateProfile, type Donation, type DonationInput, type DonorData, type Profile } from './model'

export function initialData(): DonorData {
  const end = new Date(`${today()}T12:00:00`)
  end.setDate(end.getDate() + 14)
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
  const base = { condition: '중', location: '서울 구로구', startDate: today(), endDate, description: '시연용 샘플 물품입니다.', photos: [samplePhoto], reserved: 0, status: 'waiting' as const }
  const donations: Donation[] = [
    { ...base, id: 'towels-30', name: '수건', category: '생활용품', quantity: 30, reserved: 10, status: 'progress' },
    { ...base, id: 'books-12', name: '아동 도서', category: '도서·문구', quantity: 12 },
    { ...base, id: 'water-24', name: '생수', category: '미사용 소모품', quantity: 24, condition: '상', status: 'complete', startDate: '2026-10-01', endDate: '2026-10-08', completedAt: '2026-10-08', recipient: '구로푸드뱅크' },
    { ...base, id: 'stationery-30', name: '학용품', category: '도서·문구', quantity: 30, condition: '상', status: 'complete', startDate: '2026-09-20', endDate: '2026-09-28', completedAt: '2026-09-28', recipient: 'A지역아동센터' },
  ]
  return { donations, selections: {}, profile: { name: '최윤서', birthDate: '2002-04-12', email: 'yoonseo@example.com', phone: '010-1234-5678', address: '서울 구로구' } }
}
const key = 'issum-donor-demo-v1'
function load(): { data: DonorData; storageWarning: string } {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return { data: initialData(), storageWarning: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!isDonorData(parsed)) throw new Error()
    return { data: parsed, storageWarning: '' }
  } catch {
    return { data: initialData(), storageWarning: '저장된 데모 정보를 읽지 못해 샘플로 시작했습니다.' }
  }
}
type Store = { data: DonorData; storageWarning: string; commit: (update: (data: DonorData) => DonorData) => void; save: (input: DonationInput, id?: string) => string; remove: (id: string) => void; saveProfile: (profile: Profile) => void }
export const useDonorStore = create<Store>((set, get) => ({
  ...load(),
  commit: (update) => {
    const next = update(get().data)
    // 저장 실패 시 화면 데이터도 변경하지 않아 성공으로 잘못 안내하지 않습니다.
    try { sessionStorage.setItem(key, JSON.stringify(next)) }
    catch { throw new Error('브라우저 저장 공간이 부족하거나 저장이 차단됐습니다. 사진 크기를 줄이거나 브라우저 설정을 확인해 주세요.') }
    set({ data: next, storageWarning: '' })
  },
  save: (input, id) => {
    const resultId = id ?? crypto.randomUUID()
    get().commit((data) => saveDonation(data, input, resultId, Boolean(id)))
    return resultId
  },
  remove: (id) => get().commit((data) => deleteDonation(data, id)),
  saveProfile: (profile) => {
    if (Object.keys(validateProfile(profile)).length) throw new Error('회원정보 입력 내용을 확인해 주세요.')
    get().commit((data) => ({ ...data, profile }))
  },
}))
