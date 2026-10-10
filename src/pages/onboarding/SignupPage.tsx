import { useState, type FormEvent } from 'react'
import { ArrowLeft, CircleCheck, Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import mascot from '@/assets/images/mascot/mascot.svg'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { DateField } from '@/components/common/DateField/DateField'
import { RegionSelect } from '@/components/common/RegionSelect/RegionSelect'
import { ROUTES, routePath } from '@/routes/paths'

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
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

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
    Boolean(values.password) &&
    Boolean(values.passwordConfirm) &&
    values.password === values.passwordConfirm
  const businessFieldsComplete =
    Boolean(values.businessAddress?.trim()) &&
    Boolean(values.businessAddressDetail?.trim()) &&
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
    if (['businessAddress', 'businessAddressDetail', 'businessNumber', 'openingDate'].includes(name)) {
      setBusinessVerified(false)
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canContinue) return

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsComplete(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <main className="auth-page">
      <section className="signup-page-shell">
        <header className="signup-topbar">
          <button type="button" onClick={handleBack} className="back-button" aria-label="이전 단계로 돌아가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>{step === 'profile' ? `${roleLabel} 회원가입` : '회원가입'}</h1>
        </header>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-form-content">
            <p className="signup-progress">
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
              />
            ) : null}

            {step === 'business' ? (
              <BusinessVerificationStep
                values={values}
                verified={businessVerified}
                canVerify={businessFieldsComplete}
                onChange={updateValue}
                onVerify={() => setBusinessVerified(true)}
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

          <div className="signup-submit-bar">
            <button type="submit" className="auth-button auth-button--primary w-full" disabled={!canContinue}>
              {step === 'agreements' ? '가입하기' : '다음'}
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
    <main className="auth-page">
      <section className="signup-complete-shell">
        <header className="signup-topbar">
          <button type="button" onClick={onBack} className="back-button" aria-label="약관 동의로 돌아가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>가입 완료</h1>
        </header>

        <div className="signup-complete-content">
          <div className="signup-complete-mascot">
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

        <div className="signup-submit-bar">
          <button type="button" onClick={onStart} className="auth-button auth-button--primary w-full">
            시작하기
          </button>
        </div>
      </section>
    </main>
  )
}

function SignupRoleSelection() {
  return (
    <main className="auth-page">
      <section className="signup-role-shell">
        <div className="signup-role-heading">
          <h1>작은 나눔이<br />큰 연결이 되는 곳</h1>
          <p>쓸 수 있는 물품을, 가까운 복지기관과 나눠요.</p>
        </div>

        <div className="signup-role-mascot">
          <img src={mascot} alt="IT:SSUM 상자 마스코트" />
        </div>

        <div className="signup-role-options">
          <Link to={routePath.signup('donor')} className="signup-role-card signup-role-card--donor">
            <strong>물품을 기부하고 싶어요</strong>
            <span>개인 · 학교 · 기업 · 단체</span>
          </Link>
          <Link to={routePath.signup('organization')} className="signup-role-card">
            <strong>물품이 필요한 기관이에요</strong>
            <span>사업자 확인과 필수 동의 후 필요 물품을 등록해요.</span>
          </Link>
        </div>

        <p className="signup-login-link">이미 계정이 있나요? <Link to={ROUTES.login}>로그인</Link></p>
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
  const today = getToday()

  return (
    <>
      <h2>{role === 'donor' ? '기부자 정보를 알려 주세요' : '기관 정보를 알려 주세요'}</h2>
      <p className="signup-step-description">
        {role === 'donor' ? '이름·생년월일·전화번호는 필수예요.' : '아래 정보는 모두 필수예요.'}
      </p>
      <div className="signup-field-list">
        {role === 'donor' ? (
          <>
            <TextField field={fields[0]} values={values} onChange={onChange} />
            <DateField
              id="signup-birthDate"
              label="생년월일"
              value={values.birthDate ?? ''}
              max={today}
              onChange={(value) => onChange('birthDate', value)}
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
      <label htmlFor={`signup-${field.name}`} className="auth-field-label">{field.label}</label>
      <input
        id={`signup-${field.name}`}
        type={field.type ?? 'text'}
        className="auth-input"
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
}

function SignupAccountStep({ role, values, showPassword, showPasswordConfirm, onChange, onTogglePassword, onTogglePasswordConfirm }: SignupAccountStepProps) {
  const passwordsDiffer = Boolean(values.passwordConfirm) && values.password !== values.passwordConfirm

  return (
    <>
      <h2>나눔을 시작해 볼까요?</h2>
      <p className="signup-step-description">사용할 계정 정보를 입력해 주세요.</p>
      <div className="signup-field-list">
        <div>
          <label htmlFor="signup-email" className="auth-field-label">
            {role === 'organization' ? '기관 이메일' : '이메일'}
          </label>
          <input
            id="signup-email"
            type="email"
            className="auth-input"
            placeholder={role === 'organization' ? 'example@organization.com' : 'example@email.com'}
            value={values.email ?? ''}
            onChange={(event) => onChange('email', event.target.value)}
          />
        </div>
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
      {passwordsDiffer ? <p className="signup-error">비밀번호가 일치하지 않아요.</p> : null}
      <p className="signup-login-link">이미 계정이 있나요? <Link to={ROUTES.login}>로그인</Link></p>
    </>
  )
}

type BusinessVerificationStepProps = {
  values: Record<string, string>
  verified: boolean
  canVerify: boolean
  onChange: (name: string, value: string) => void
  onVerify: () => void
}

function BusinessVerificationStep({
  values,
  verified,
  canVerify,
  onChange,
  onVerify,
}: BusinessVerificationStepProps) {
  const today = getToday()

  return (
    <>
      <h2>사업자 정보를 확인해요</h2>
      <p className="signup-step-description">기관 심사에 필요한 사업자 정보를 입력해 주세요.</p>
      <div className="signup-field-list">
        <AddressSearchField
          id="signup-business-address"
          label="기관 상세주소"
          address={values.businessAddress ?? ''}
          detailAddress={values.businessAddressDetail ?? ''}
          onAddressChange={(value) => onChange('businessAddress', value)}
          onDetailAddressChange={(value) => onChange('businessAddressDetail', value)}
        />
        <div>
          <label htmlFor="signup-business-number" className="auth-field-label">사업자번호 10자리</label>
          <input
            id="signup-business-number"
            inputMode="numeric"
            className="auth-input"
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
          className="auth-button auth-button--secondary w-full"
          disabled={!canVerify || verified}
          onClick={onVerify}
        >
          {verified ? '사업자 정보 확인 완료' : '사업자 정보 확인'}
        </button>
      </div>
      {verified ? (
        <div className="verification-success" role="status">
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
      <p className="signup-step-description">사업자 확인과 별도 기준이에요.</p>
      <div className="eligibility-list">
        <div className="eligibility-card">
          <div className="eligibility-card-title">
            <CircleCheck aria-hidden size={18} />
            <strong>가입 대상</strong>
          </div>
          <p>복지·비영리 활동에 기부 물품을 사용하는 기관</p>
        </div>
        <div className="eligibility-card">
          <div className="eligibility-card-title">
            <CircleCheck aria-hidden size={18} />
            <strong>제외 대상</strong>
          </div>
          <p>일반 영리 사업자는 가입 대상이 아니에요.</p>
        </div>
      </div>
      <label className="eligibility-confirm">
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
      <label htmlFor={id} className="auth-field-label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="auth-input pr-12"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="password-toggle" onClick={onToggle} aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}>
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
      <p className="signup-step-description">가입에 필요한 약관을 확인해 주세요.</p>
      <label className="agreement-all">
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
      <div className="agreement-list">
        {agreementItems.map((item) => (
          <div key={item.name} className="agreement-item">
            <label className="agreement-item-label">
              <input
                type="checkbox"
                checked={Boolean(agreements[item.name])}
                onChange={(event) => onChange({ ...agreements, [item.name]: event.target.checked })}
              />
              <span>[필수] {item.label}</span>
            </label>
            <button type="button" className="agreement-view-button">보기</button>
          </div>
        ))}
      </div>
      <p className="agreement-help">필수 동의를 마쳐야 가입할 수 있어요.</p>
    </>
  )
}
