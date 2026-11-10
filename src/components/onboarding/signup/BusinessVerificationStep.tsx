import { CircleCheck } from 'lucide-react'
import { DateField } from '@/components/common/DateField/DateField'
import { getToday } from '@/features/auth/signup/date'
import type { SignupValues } from '@/features/auth/signup/types'

type BusinessVerificationStepProps = {
  values: SignupValues
  verified: boolean
  canVerify: boolean
  loading: boolean
  error: string
  onChange: (name: string, value: string) => void
  onVerify: () => void
}

export function BusinessVerificationStep({
  values,
  verified,
  canVerify,
  loading,
  error,
  onChange,
  onVerify,
}: BusinessVerificationStepProps) {
  const today = getToday()

  return (
    <>
      <h2>사업자 정보를 확인해요</h2>
      <p className="mb-5 mt-1 text-[11px] leading-4 text-neutral-600">기관 심사에 필요한 사업자 정보를 입력해 주세요.</p>
      <div className="grid gap-3.5">
        <div>
          <label htmlFor="signup-business-number" className="mb-2 block text-sm font-medium leading-5 text-neutral-900">사업자번호 10자리</label>
          <input
            id="signup-business-number"
            inputMode="numeric"
            className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10"
            placeholder="123-45-67890"
            value={values.businessNumber ?? ''}
            onChange={(event) => onChange('businessNumber', event.target.value)}
          />
        </div>
        <DateField
          id="signup-opening-date"
          label="개업일자"
          value={values.openingDate ?? ''}
          max={today}
          onChange={(value) => onChange('openingDate', value)}
        />
        <button
          type="button"
          className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] border border-neutral-300 bg-white px-5 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500"
          disabled={!canVerify || verified || loading}
          onClick={onVerify}
        >
          {verified ? '사업자 정보 확인 완료' : loading ? '확인 중...' : '사업자 정보 확인'}
        </button>
      </div>
      {error ? <p className="mt-3 text-xs leading-[18px] text-error" role="alert">{error}</p> : null}
      {verified ? (
        <div className="mt-4 flex gap-2.5 rounded-control bg-primary-100 p-4 text-primary-700 [&>svg]:mt-0.5 [&>svg]:shrink-0 [&_strong]:block [&_strong]:text-sm [&_strong]:leading-5 [&_span]:mt-1.5 [&_span]:block [&_span]:text-xs [&_span]:leading-[18px] [&_span]:text-neutral-700" role="status">
          <CircleCheck aria-hidden size={18} />
          <div>
            <strong>사업자 확인 완료</strong>
            <span>운영자 승인·증빙 제출 없이 계속할 수 있어요.</span>
          </div>
        </div>
      ) : null}
    </>
  )
}
