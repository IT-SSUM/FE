import { useEffect, useState } from 'react'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { DateField } from '@/components/common/DateField/DateField'
import { RegionSelect } from '@/components/common/RegionSelect/RegionSelect'
import { Toast } from '@/components/common/Toast/Toast'
import { getYesterday } from '@/features/auth/signup/date'
import type { SignupField, SignupRole, SignupValues } from '@/features/auth/signup/types'

type SignupProfileStepProps = {
  role: SignupRole
  fields: SignupField[]
  values: SignupValues
  onChange: (name: string, value: string) => void
}

export function SignupProfileStep({ role, fields, values, onChange }: SignupProfileStepProps) {
  const latestBirthDate = getYesterday()
  const [birthDateToastKey, setBirthDateToastKey] = useState(0)

  useEffect(() => {
    if (!birthDateToastKey) return
    const timer = window.setTimeout(() => setBirthDateToastKey(0), 3000)
    return () => window.clearTimeout(timer)
  }, [birthDateToastKey])

  return (
    <>
      <h2>{role === 'donor' ? '기부자 정보를 알려 주세요' : '기관 정보를 알려 주세요'}</h2>
      <p className="mb-5 mt-1 text-[11px] leading-4 text-neutral-600">
        {role === 'donor' ? '이름·생년월일·전화번호는 필수예요.' : '아래 정보는 모두 필수예요.'}
      </p>
      <div className="grid gap-3.5">
        {role === 'donor' ? (
          <>
            <TextField field={fields[0]} values={values} onChange={onChange} />
            <DateField
              id="signup-birthDate"
              label="생년월일"
              value={values.birthDate ?? ''}
              max={latestBirthDate}
              onChange={(value) => onChange('birthDate', value)}
              onInvalidSelection={() => setBirthDateToastKey((current) => current + 1)}
            />
            <TextField field={fields[2]} values={values} onChange={onChange} />
            <RegionSelect
              id="signup-region"
              label="활동 지역"
              value={values.region ?? ''}
              optional
              onChange={(value) => onChange('region', value)}
            />
          </>
        ) : (
          <>
            <TextField field={fields[0]} values={values} onChange={onChange} />
            <AddressSearchField
              id="signup-address"
              label="기관 주소"
              address={values.address ?? ''}
              detailAddress={values.addressDetail ?? ''}
              onAddressChange={(value) => onChange('address', value)}
              onDetailAddressChange={(value) => onChange('addressDetail', value)}
            />
            <TextField field={fields[3]} values={values} onChange={onChange} />
            <TextField field={fields[4]} values={values} onChange={onChange} />
          </>
        )}
      </div>
      {birthDateToastKey ? (
        <div className="pointer-events-none fixed left-1/2 top-4 z-300 w-full max-w-[393px] -translate-x-1/2 px-5">
          <Toast
            variant="error"
            title="생년월일을 확인해 주세요"
            description="생년월일은 오늘보다 이전 날짜를 선택해 주세요."
            className="shadow-[0_12px_32px_rgb(18_61_49/18%)]"
          />
        </div>
      ) : null}
    </>
  )
}

type TextFieldProps = {
  field: SignupField
  values: SignupValues
  onChange: (name: string, value: string) => void
}

function TextField({ field, values, onChange }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={`signup-${field.name}`} className="mb-2 block text-sm font-medium leading-5 text-neutral-900">{field.label}</label>
      <input
        id={`signup-${field.name}`}
        type={field.type ?? 'text'}
        className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10"
        placeholder={field.placeholder}
        value={values[field.name] ?? ''}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </div>
  )
}
