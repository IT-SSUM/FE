import { agreementItems } from '@/features/auth/signup/constants'
import type { SignupAgreements } from '@/features/auth/signup/types'

type SignupAgreementStepProps = {
  agreements: SignupAgreements
  onChange: (agreements: SignupAgreements) => void
}

export function SignupAgreementStep({ agreements, onChange }: SignupAgreementStepProps) {
  const allChecked = agreementItems.every((item) => agreements[item.name])

  return (
    <>
      <h2>안심하고 나눔을 시작해요</h2>
      <p className="mb-5 mt-1 text-[11px] leading-4 text-neutral-600">가입에 필요한 약관을 확인해 주세요.</p>
      <label className="flex min-h-16 items-center gap-3 rounded-control border border-primary-200 bg-linear-to-br from-primary-100 to-[#eef9f3] px-4 shadow-[0_4px_14px_rgb(31_122_96/6%)] [&_input]:size-5 [&_input]:accent-primary-700">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(event) => {
            const checked = event.target.checked
            onChange(Object.fromEntries(agreementItems.map((item) => [item.name, checked])))
          }}
        />
        <strong>필수 약관 전체 동의</strong>
      </label>
      <div className="mt-4 grid overflow-hidden rounded-control border border-[#e1ebe5] bg-[#f4f8f5] px-4 [&_input]:size-5 [&_input]:accent-primary-700">
        {agreementItems.map((item) => (
          <div key={item.name} className="flex min-h-[58px] items-center justify-between border-b border-[#e1ebe5] last:border-b-0">
            <label className="flex items-center gap-3 text-[13px] leading-5 text-neutral-800">
              <input
                type="checkbox"
                checked={Boolean(agreements[item.name])}
                onChange={(event) => onChange({ ...agreements, [item.name]: event.target.checked })}
              />
              <span>[필수] {item.label}</span>
            </label>
            <button type="button" className="rounded-full border-0 bg-primary-100 px-[11px] py-[7px] text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-200">보기</button>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-[#f0f5f1] px-3 py-2.5 text-xs leading-[18px] text-neutral-700">필수 동의를 마쳐야 가입할 수 있어요.</p>
    </>
  )
}
