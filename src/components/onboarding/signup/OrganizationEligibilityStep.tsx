import { CircleCheck } from 'lucide-react'

type OrganizationEligibilityStepProps = {
  confirmed: boolean
  onChange: (confirmed: boolean) => void
}

export function OrganizationEligibilityStep({ confirmed, onChange }: OrganizationEligibilityStepProps) {
  return (
    <>
      <h2>가입 대상 기관인지 확인해요</h2>
      <p className="mb-5 mt-1 text-[11px] leading-4 text-neutral-600">사업자 확인과 별도 기준이에요.</p>
      <div className="mt-5 grid gap-3.5">
        <div className="rounded-control bg-primary-100 p-4 [&>p]:mt-2 [&>p]:text-xs [&>p]:leading-[18px] [&>p]:text-neutral-700">
          <div className="flex items-center gap-2 text-sm leading-5 text-primary-700">
            <CircleCheck aria-hidden size={18} />
            <strong>가입 대상</strong>
          </div>
          <p>복지·비영리 활동에 기부 물품을 사용하는 기관</p>
        </div>
        <div className="rounded-control bg-primary-100 p-4 [&>p]:mt-2 [&>p]:text-xs [&>p]:leading-[18px] [&>p]:text-neutral-700">
          <div className="flex items-center gap-2 text-sm leading-5 text-primary-700">
            <CircleCheck aria-hidden size={18} />
            <strong>제외 대상</strong>
          </div>
          <p>일반 영리 사업자는 가입 대상이 아니에요.</p>
        </div>
      </div>
      <label className="mt-4 flex min-h-[58px] items-center gap-3 rounded-[14px] border border-neutral-300 bg-white px-4 text-[13px] leading-5 [&_input]:size-5 [&_input]:accent-primary-700">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => onChange(event.target.checked)}
        />
        <strong>가입 대상 기관임을 확인 (필수)</strong>
      </label>
    </>
  )
}
