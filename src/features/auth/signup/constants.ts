import type { SignupField, SignupStep } from './types'

export const donorFields: SignupField[] = [
  { name: 'name', label: '이름', placeholder: '이름을 입력해 주세요', required: true },
  { name: 'birthDate', label: '생년월일', placeholder: 'YYYY.MM.DD', required: true },
  { name: 'phone', label: '전화번호', placeholder: '010-0000-0000', type: 'tel', required: true },
  { name: 'region', label: '활동 지역 (선택)', placeholder: '서울 구로구 · 시·구 선택' },
]

export const organizationFields: SignupField[] = [
  { name: 'organizationName', label: '기관명', placeholder: '기관명을 입력해 주세요', required: true },
  { name: 'address', label: '기관 주소', placeholder: '상세주소', required: true },
  { name: 'addressDetail', label: '기관 상세주소', placeholder: '상세주소', required: true },
  { name: 'representative', label: '대표자 이름', placeholder: '대표자 이름을 입력해 주세요', required: true },
  { name: 'phone', label: '기관 전화번호', placeholder: '지역번호 포함 전화번호', type: 'tel', required: true },
]

export const donorSteps: SignupStep[] = ['profile', 'account', 'agreements']
export const organizationSteps: SignupStep[] = [
  'profile',
  'account',
  'business',
  'eligibility',
  'agreements',
]

export const stepLabels: Record<SignupStep, string> = {
  profile: '필수 정보',
  account: '계정 정보',
  business: '사업자 확인',
  eligibility: '기관 자격 확인',
  agreements: '약관 동의',
}

export const agreementItems = [
  { name: 'terms', label: '서비스 이용약관' },
  { name: 'privacy', label: '개인정보 수집·이용' },
] as const
