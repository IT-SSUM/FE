import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, CircleCheck, Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import mascot from '@/assets/images/mascot/mascot.svg'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { DateField } from '@/components/common/DateField/DateField'
import { RegionSelect } from '@/components/common/RegionSelect/RegionSelect'
import { Toast } from '@/components/common/Toast/Toast'
import { ROUTES, routePath } from '@/routes/paths'
import {
  confirmEmailVerification,
  getAuthErrorMessage,
  sendEmailVerification,
  signUpDonor,
  signUpOrganization,
  verifyBusiness,
} from '@/features/auth/api'
import { saveAuthSession } from '@/features/auth/storage'

type SignupRole = 'donor' | 'organization'
type SignupStep = 'profile' | 'account' | 'business' | 'eligibility' | 'agreements'

type Field = {
  name: string
  label: string
  placeholder: string
  type?: string
  required?: boolean
}

const donorFields: Field[] = [
  { name: 'name', label: '이름', placeholder: '이름을 입력해 주세요', required: true },
  { name: 'birthDate', label: '생년월일', placeholder: 'YYYY.MM.DD', required: true },
  { name: 'phone', label: '전화번호', placeholder: '010-0000-0000', type: 'tel', required: true },
  { name: 'region', label: '활동 지역 (선택)', placeholder: '서울 구로구 · 시·구 선택' },
]

const organizationFields: Field[] = [
  { name: 'organizationName', label: '기관명', placeholder: '기관명을 입력해 주세요', required: true },
  { name: 'address', label: '기관 주소', placeholder: '상세주소', required: true },
  { name: 'addressDetail', label: '기관 상세주소', placeholder: '상세주소', required: true },
  { name: 'representative', label: '대표자 이름', placeholder: '대표자 이름을 입력해 주세요', required: true },
  { name: 'phone', label: '기관 전화번호', placeholder: '지역번호 포함 전화번호', type: 'tel', required: true },
]

const donorSteps: SignupStep[] = ['profile', 'account', 'agreements']
const organizationSteps: SignupStep[] = [
  'profile',
  'account',
  'business',
  'eligibility',
  'agreements',
]

const stepLabels: Record<SignupStep, string> = {
  profile: '필수 정보',
  account: '계정 정보',
  business: '사업자 확인',
  eligibility: '기관 자격 확인',
  agreements: '약관 동의',
}

const agreementItems = [
  { name: 'terms', label: '서비스 이용약관' },
  { name: 'privacy', label: '개인정보 수집·이용' },
] as const

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export function SignupPage() {
  const { role: roleParam } = useParams()
  const navigate = useNavigate()
  const role = roleParam as SignupRole | undefined
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [agreements, setAgreements] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [businessVerified, setBusinessVerified] = useState(false)
  const [businessVerificationToken, setBusinessVerificationToken] = useState('')
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false)
  const [emailVerificationToken, setEmailVerificationToken] = useState('')
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [emailVerificationLoading, setEmailVerificationLoading] = useState<'send' | 'confirm' | null>(null)
  const [emailVerificationError, setEmailVerificationError] = useState('')
  const [emailVerificationExpiresIn, setEmailVerificationExpiresIn] = useState(0)
  const [emailResendCooldown, setEmailResendCooldown] = useState(0)
  const [businessVerificationLoading, setBusinessVerificationLoading] = useState(false)
  const [businessVerificationError, setBusinessVerificationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (emailVerificationExpiresIn <= 0 && emailResendCooldown <= 0) return

    const timer = window.setInterval(() => {
      setEmailVerificationExpiresIn((current) => Math.max(0, current - 1))
      setEmailResendCooldown((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [emailVerificationExpiresIn, emailResendCooldown])

  if (roleParam && roleParam !== 'donor' && roleParam !== 'organization') {
    return <Navigate to={ROUTES.signup} replace />
  }

  if (!role) {
    return <SignupRoleSelection />
  }

  const roleLabel = role === 'donor' ? '기부자' : '기관'
  const fields = role === 'organization' ? organizationFields : donorFields
  const steps = role === 'organization' ? organizationSteps : donorSteps
  const step = steps[stepIndex]
  const requiredFieldsComplete = fields
    .filter((field) => field.required)
    .every((field) => values[field.name]?.trim())
  const accountComplete =
    Boolean(values.email?.trim()) &&
    Boolean(emailVerificationToken) &&
    Boolean(values.password) &&
    Boolean(values.passwordConfirm) &&
    values.password === values.passwordConfirm &&
    /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/.test(values.password)
  const businessFieldsComplete =
    values.businessNumber?.replace(/\D/g, '').length === 10 &&
    Boolean(values.openingDate?.trim())
  const agreementsComplete = agreementItems
    .every((item) => agreements[item.name])
  const canContinue = {
    profile: requiredFieldsComplete,
    account: accountComplete,
    business: businessVerified,
    eligibility: eligibilityConfirmed,
    agreements: agreementsComplete,
  }[step]

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    if (name === 'email') {
      setEmailVerificationToken('')
      setEmailVerificationSent(false)
      setEmailVerificationError('')
      setEmailVerificationExpiresIn(0)
      setEmailResendCooldown(0)
      setValues((current) => ({ ...current, email: value, emailCode: '' }))
    }
    if (['businessNumber', 'openingDate', 'representative'].includes(name)) {
      setBusinessVerified(false)
      setBusinessVerificationToken('')
      setBusinessVerificationError('')
    }
  }

  const handleSendEmailVerification = async () => {
    const email = values.email?.trim() ?? ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailVerificationError('이메일 형식을 확인해 주세요.')
      return
    }

    setEmailVerificationLoading('send')
    setEmailVerificationError('')
    setEmailVerificationToken('')
    try {
      const result = await sendEmailVerification(email)
      setValues((current) => ({ ...current, emailCode: '' }))
      setEmailVerificationSent(true)
      setEmailVerificationExpiresIn(result.expiresInSeconds)
      setEmailResendCooldown(60)
    } catch (error) {
      setEmailVerificationError(getAuthErrorMessage(error, '인증번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setEmailVerificationLoading(null)
    }
  }

  const handleConfirmEmailVerification = async () => {
    const code = values.emailCode?.trim() ?? ''
    if (!/^\d{6}$/.test(code)) {
      setEmailVerificationError('메일로 받은 6자리 인증번호를 입력해 주세요.')
      return
    }

    setEmailVerificationLoading('confirm')
    setEmailVerificationError('')
    try {
      const result = await confirmEmailVerification(values.email.trim(), code)
      setEmailVerificationToken(result.emailVerificationToken)
      setEmailVerificationExpiresIn(0)
    } catch (error) {
      setEmailVerificationError(getAuthErrorMessage(error, '인증번호를 확인하지 못했어요.'))
    } finally {
      setEmailVerificationLoading(null)
    }
  }

  const handleVerifyBusiness = async () => {
    setBusinessVerificationLoading(true)
    setBusinessVerificationError('')
    try {
      const result = await verifyBusiness({
        businessNumber: values.businessNumber.trim(),
        openingDate: values.openingDate,
        representativeName: values.representative.trim(),
      })
      setBusinessVerificationToken(result.businessVerificationToken)
      setBusinessVerified(true)
    } catch (error) {
      setBusinessVerificationError(getAuthErrorMessage(error, '사업자 정보를 확인하지 못했어요.'))
    } finally {
      setBusinessVerificationLoading(false)
    }
  }

  const handleBack = () => {
    if (isComplete) {
      setIsComplete(false)
      return
    }

    if (stepIndex === 0) {
      navigate(ROUTES.signup)
      return
    }
    setStepIndex((current) => current - 1)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canContinue) return

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const session = role === 'donor'
        ? await signUpDonor({
            emailVerificationToken,
            email: values.email.trim(),
            password: values.password,
            name: values.name.trim(),
            birthDate: values.birthDate,
            phone: values.phone.trim(),
            ...(values.region === '경기도 부천시' ? { regionId: 1 } : {}),
            agreedTerms: ['SERVICE', 'PRIVACY'],
          })
        : await signUpOrganization({
            emailVerificationToken,
            businessVerificationToken,
            email: values.email.trim(),
            password: values.password,
            name: values.organizationName.trim(),
            representativeName: values.representative.trim(),
            businessNumber: values.businessNumber.trim(),
            openingDate: values.openingDate,
            phone: values.phone.trim(),
            address: values.address.trim(),
            addressDetail: values.addressDetail?.trim() || undefined,
            agreedTerms: ['SERVICE', 'PRIVACY', 'ORG_ELIGIBILITY'],
          })
      saveAuthSession(session)
      setIsComplete(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, '회원가입을 완료하지 못했어요. 입력 정보를 확인해 주세요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStart = () => {
    navigate(role === 'donor' ? ROUTES.donor.home : ROUTES.organization.home)
  }

  if (isComplete) {
    return (
      <SignupComplete
        role={role}
        onBack={handleBack}
        onStart={handleStart}
      />
    )
  }

  return (
    <main className="min-h-dvh bg-[#eaf2ed]">
      <section className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <header className="flex min-h-[72px] items-center px-5 [&_h1]:ml-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:leading-6">
          <button type="button" onClick={handleBack} className="inline-flex size-10 items-center justify-center rounded-full border-0 bg-transparent text-primary-700 hover:bg-primary-100" aria-label="이전 단계로 돌아가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>{step === 'profile' ? `${roleLabel} 회원가입` : '회원가입'}</h1>
        </header>

        <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="px-5 pb-7 pt-3 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-8 [&_h2]:tracking-[-0.02em]">
            <p className="m-0 text-sm font-bold leading-5 text-primary-600">
              {stepIndex + 1} / {steps.length} · {stepLabels[step]}
            </p>

            {step === 'profile' ? (
              <SignupProfileStep
                role={role}
                fields={fields}
                values={values}
                onChange={updateValue}
              />
            ) : null}

            {step === 'account' ? (
              <SignupAccountStep
                role={role}
                values={values}
                showPassword={showPassword}
                showPasswordConfirm={showPasswordConfirm}
                onChange={updateValue}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onTogglePasswordConfirm={() => setShowPasswordConfirm((current) => !current)}
                verificationSent={emailVerificationSent}
                verified={Boolean(emailVerificationToken)}
                verificationLoading={emailVerificationLoading}
                verificationError={emailVerificationError}
                verificationExpiresIn={emailVerificationExpiresIn}
                resendCooldown={emailResendCooldown}
                onSendVerification={handleSendEmailVerification}
                onConfirmVerification={handleConfirmEmailVerification}
              />
            ) : null}

            {step === 'business' ? (
              <BusinessVerificationStep
                values={values}
                verified={businessVerified}
                canVerify={businessFieldsComplete}
                onChange={updateValue}
                loading={businessVerificationLoading}
                error={businessVerificationError}
                onVerify={handleVerifyBusiness}
              />
            ) : null}

            {step === 'eligibility' ? (
              <OrganizationEligibilityStep
                confirmed={eligibilityConfirmed}
                onChange={setEligibilityConfirmed}
              />
            ) : null}

            {step === 'agreements' ? (
              <SignupAgreementStep agreements={agreements} onChange={setAgreements} />
            ) : null}
          </div>

          <div className="sticky bottom-0 z-2 mt-auto border-t border-neutral-200 bg-surface-canvas px-5 py-4">
            {submitError ? <p className="mb-3 text-center text-xs leading-[18px] text-error" role="alert">{submitError}</p> : null}
            <button type="submit" className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] border border-primary-700 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:border-primary-800 hover:bg-primary-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500" disabled={!canContinue || isSubmitting}>
              {isSubmitting ? '가입 중...' : step === 'agreements' ? '가입하기' : '다음'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

type SignupCompleteProps = {
  role: SignupRole
  onBack: () => void
  onStart: () => void
}

function SignupComplete({ role, onBack, onStart }: SignupCompleteProps) {
  const isDonor = role === 'donor'

  return (
    <main className="min-h-dvh bg-[#eaf2ed]">
      <section className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <header className="flex min-h-[72px] items-center px-5 [&_h1]:ml-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:leading-6">
          <button type="button" onClick={onBack} className="inline-flex size-10 items-center justify-center rounded-full border-0 bg-transparent text-primary-700 hover:bg-primary-100" aria-label="약관 동의로 돌아가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>가입 완료</h1>
        </header>

        <div className="px-5 pb-8 pt-[104px] text-center [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-8 [&_h2]:tracking-[-0.02em] [&_p]:mt-5 [&_p]:text-[13px] [&_p]:leading-5 [&_p]:text-neutral-600">
          <div className="flex h-[170px] w-full items-center justify-center rounded-[18px] bg-primary-100 [&_img]:w-28">
            <img src={mascot} alt="IT:SSUM 상자 마스코트" />
          </div>
          <h2>{isDonor ? '나눔을 시작할 준비가 됐어요' : '함께하게 되어 반가워요'}</h2>
          <p>
            {isDonor ? (
              <>쓸 수 있는 물품을<br />필요한 곳에 이어 주세요.</>
            ) : (
              '사업자 확인과 필수 동의가 완료됐어요.'
            )}
          </p>
        </div>

        <div className="sticky bottom-0 z-2 mt-auto border-t border-neutral-200 bg-surface-canvas px-5 py-4">
          <button type="button" onClick={onStart} className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] border border-primary-700 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:border-primary-800 hover:bg-primary-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500">
            시작하기
          </button>
        </div>
      </section>
    </main>
  )
}

function SignupRoleSelection() {
  return (
    <main className="min-h-dvh bg-[#eaf2ed]">
      <section className="mx-auto min-h-dvh w-full max-w-[393px] bg-surface-canvas px-5 pb-10 pt-[68px] min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <div className="[&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-[34px] [&_h1]:tracking-[-0.02em] [&_p]:mt-5 [&_p]:text-sm [&_p]:leading-5 [&_p]:text-neutral-600">
          <h1>작은 나눔이<br />큰 연결이 되는 곳</h1>
          <p>쓸 수 있는 물품을, 가까운 복지기관과 나눠요.</p>
        </div>

        <div className="mt-6 flex h-[150px] w-full items-center justify-center rounded-[18px] bg-error-bg [&_img]:w-[126px]">
          <img src={mascot} alt="IT:SSUM 상자 마스코트" />
        </div>

        <div className="mt-5 grid gap-4">
          <Link to={routePath.signup('donor')} className="flex min-h-[84px] flex-col justify-center rounded-[18px] border border-primary-200 bg-primary-100 p-4 [&_strong]:text-base [&_strong]:leading-6 [&_span]:mt-1.5 [&_span]:text-[13px] [&_span]:leading-5 [&_span]:text-neutral-600">
            <strong>물품을 기부하고 싶어요</strong>
            <span>개인 · 학교 · 기업 · 단체</span>
          </Link>
          <Link to={routePath.signup('organization')} className="flex min-h-[84px] flex-col justify-center rounded-[18px] border border-neutral-300 bg-white p-4 [&_strong]:text-base [&_strong]:leading-6 [&_span]:mt-1.5 [&_span]:text-[13px] [&_span]:leading-5 [&_span]:text-neutral-600">
            <strong>물품이 필요한 기관이에요</strong>
            <span>사업자 확인과 필수 동의 후 필요 물품을 등록해요.</span>
          </Link>
        </div>

        <p className="mt-5 text-[13px] leading-5 text-primary-700 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-3">이미 계정이 있나요? <Link to={ROUTES.login}>로그인</Link></p>
      </section>
    </main>
  )
}

type SignupProfileStepProps = {
  role: SignupRole
  fields: Field[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
}

function SignupProfileStep({ role, fields, values, onChange }: SignupProfileStepProps) {
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
  field: Field
  values: Record<string, string>
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

type SignupAccountStepProps = {
  role: SignupRole
  values: Record<string, string>
  showPassword: boolean
  showPasswordConfirm: boolean
  onChange: (name: string, value: string) => void
  onTogglePassword: () => void
  onTogglePasswordConfirm: () => void
  verificationSent: boolean
  verified: boolean
  verificationLoading: 'send' | 'confirm' | null
  verificationError: string
  verificationExpiresIn: number
  resendCooldown: number
  onSendVerification: () => void
  onConfirmVerification: () => void
}

function SignupAccountStep({
  role,
  values,
  showPassword,
  showPasswordConfirm,
  onChange,
  onTogglePassword,
  onTogglePasswordConfirm,
  verificationSent,
  verified,
  verificationLoading,
  verificationError,
  verificationExpiresIn,
  resendCooldown,
  onSendVerification,
  onConfirmVerification,
}: SignupAccountStepProps) {
  const passwordsDiffer = Boolean(values.passwordConfirm) && values.password !== values.passwordConfirm
  const passwordInvalid = Boolean(values.password) && !/^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/.test(values.password)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() ?? '')

  return (
    <>
      <h2>나눔을 시작해 볼까요?</h2>
      <p className="mb-5 mt-1 text-[11px] leading-4 text-neutral-600">사용할 계정 정보를 입력해 주세요.</p>
      <div className="grid gap-3.5">
        <div>
          <label htmlFor="signup-email" className="mb-2 block text-sm font-medium leading-5 text-neutral-900">
            {role === 'organization' ? '기관 이메일' : '이메일'}
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10"
              placeholder={role === 'organization' ? 'example@organization.com' : 'example@email.com'}
              value={values.email ?? ''}
              disabled={verified}
              onChange={(event) => onChange('email', event.target.value)}
            />
            <button
              type="button"
              className="inline-flex h-[52px] min-w-24 items-center justify-center rounded-input border border-neutral-500 bg-white px-3 text-[13px] font-semibold text-primary-700 hover:border-primary-700 hover:bg-primary-100 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-500"
              disabled={!emailValid || verified || verificationLoading !== null || resendCooldown > 0}
              onClick={onSendVerification}
            >
              {verified
                ? '인증 완료'
                : verificationLoading === 'send'
                  ? '발송 중...'
                  : resendCooldown > 0
                    ? `${resendCooldown}초`
                    : verificationSent
                      ? '재발송'
                      : '인증번호'}
            </button>
          </div>
        </div>
        {verificationSent && !verified ? (
          <div>
            <label htmlFor="signup-email-code" className="mb-2 block text-sm font-medium leading-5 text-neutral-900">이메일 인증번호</label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <input
                id="signup-email-code"
                inputMode="numeric"
                maxLength={6}
                className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10"
                placeholder="6자리 인증번호"
                value={values.emailCode ?? ''}
                onChange={(event) => onChange('emailCode', event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button
                type="button"
                className="inline-flex h-[52px] min-w-24 items-center justify-center rounded-input border border-primary-700 bg-primary-700 px-3 text-[13px] font-semibold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500"
                disabled={values.emailCode?.length !== 6 || verificationLoading !== null || verificationExpiresIn <= 0}
                onClick={onConfirmVerification}
              >
                {verificationLoading === 'confirm' ? '확인 중...' : '확인'}
              </button>
            </div>
            <p className={`mt-2 text-xs leading-[18px] ${verificationExpiresIn > 0 ? 'text-neutral-600' : 'text-error'}`}>
              {verificationExpiresIn > 0
                ? `인증번호 유효시간 ${formatCountdown(verificationExpiresIn)}`
                : '인증번호가 만료됐어요. 다시 발송해 주세요.'}
            </p>
          </div>
        ) : null}
        {verified ? <p className="text-xs font-semibold leading-[18px] text-primary-700">이메일 인증이 완료됐어요.</p> : null}
        {verificationError ? <p className="text-xs leading-[18px] text-error" role="alert">{verificationError}</p> : null}
        <PasswordField
          id="signup-password"
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          value={values.password ?? ''}
          visible={showPassword}
          onChange={(value) => onChange('password', value)}
          onToggle={onTogglePassword}
        />
        <PasswordField
          id="signup-password-confirm"
          label="비밀번호 확인"
          placeholder="비밀번호를 한 번 더 입력해 주세요"
          value={values.passwordConfirm ?? ''}
          visible={showPasswordConfirm}
          onChange={(value) => onChange('passwordConfirm', value)}
          onToggle={onTogglePasswordConfirm}
        />
      </div>
      {passwordInvalid ? <p className="mt-2 text-xs leading-[18px] text-error">비밀번호는 영문과 숫자를 포함한 8~20자로 입력해 주세요.</p> : null}
      {passwordsDiffer ? <p className="mt-2 text-xs leading-[18px] text-error">비밀번호가 일치하지 않아요.</p> : null}
      <p className="mt-5 text-[13px] leading-5 text-primary-700 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-3">이미 계정이 있나요? <Link to={ROUTES.login}>로그인</Link></p>
    </>
  )
}

type BusinessVerificationStepProps = {
  values: Record<string, string>
  verified: boolean
  canVerify: boolean
  loading: boolean
  error: string
  onChange: (name: string, value: string) => void
  onVerify: () => void
}

function BusinessVerificationStep({
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

type OrganizationEligibilityStepProps = {
  confirmed: boolean
  onChange: (confirmed: boolean) => void
}

function OrganizationEligibilityStep({ confirmed, onChange }: OrganizationEligibilityStepProps) {
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

type PasswordFieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  visible: boolean
  onChange: (value: string) => void
  onToggle: () => void
}

function PasswordField({ id, label, placeholder, value, visible, onChange, onToggle }: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium leading-5 text-neutral-900">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 pr-12 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="absolute right-[5px] top-1/2 inline-flex size-[42px] -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent text-primary-700" onClick={onToggle} aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}>
          {visible ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
        </button>
      </div>
    </div>
  )
}

type SignupAgreementStepProps = {
  agreements: Record<string, boolean>
  onChange: (agreements: Record<string, boolean>) => void
}

function SignupAgreementStep({ agreements, onChange }: SignupAgreementStepProps) {
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
