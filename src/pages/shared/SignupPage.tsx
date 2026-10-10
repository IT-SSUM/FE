import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import mascot from '@/assets/images/mascot/mascot.svg'
import { setAuthSession } from '@/routes/authSession'
import { ROUTES, routePath } from '@/routes/paths'

type SignupRole = 'donor' | 'organization'
type SignupStep = 1 | 2 | 3

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
  { name: 'email', label: '이메일', placeholder: 'example@email.com', type: 'email', required: true },
  { name: 'phone', label: '전화번호', placeholder: '010-0000-0000', type: 'tel', required: true },
  { name: 'region', label: '활동 지역 (선택)', placeholder: '서울 구로구 · 시·구 선택' },
]

const organizationFields: Field[] = [
  { name: 'organizationName', label: '기관명', placeholder: '기관명을 입력해 주세요', required: true },
  { name: 'address', label: '기관 주소', placeholder: '상세주소', required: true },
  { name: 'representative', label: '대표자 이름', placeholder: '대표자 이름을 입력해 주세요', required: true },
  { name: 'phone', label: '기관 전화번호', placeholder: '지역번호 포함 전화번호', type: 'tel', required: true },
  { name: 'email', label: '기관 이메일', placeholder: 'example@organization.com', type: 'email', required: true },
  { name: 'businessNumber', label: '사업자등록번호', placeholder: '000-00-00000', required: true },
]

const agreementItems = [
  { name: 'terms', label: '서비스 이용약관 동의', required: true },
  { name: 'privacy', label: '개인정보 수집 및 이용 동의', required: true },
  { name: 'marketing', label: '나눔 소식 및 혜택 수신 동의', required: false },
] as const

export function SignupPage() {
  const { role: roleParam } = useParams()
  const navigate = useNavigate()
  const role = roleParam as SignupRole | undefined
  const [step, setStep] = useState<SignupStep>(1)
  const [values, setValues] = useState<Record<string, string>>({})
  const [agreements, setAgreements] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const fields = useMemo(
    () => (role === 'organization' ? organizationFields : donorFields),
    [role],
  )

  if (roleParam && roleParam !== 'donor' && roleParam !== 'organization') {
    return <Navigate to={ROUTES.signup} replace />
  }

  if (!role) {
    return <SignupRoleSelection />
  }

  const roleLabel = role === 'donor' ? '기부자' : '기관'
  const requiredFieldsComplete = fields
    .filter((field) => field.required)
    .every((field) => values[field.name]?.trim())
  const accountComplete =
    Boolean(values.password) &&
    Boolean(values.passwordConfirm) &&
    values.password === values.passwordConfirm
  const agreementsComplete = agreementItems
    .filter((item) => item.required)
    .every((item) => agreements[item.name])
  const canContinue =
    step === 1
      ? requiredFieldsComplete
      : step === 2
        ? accountComplete
        : agreementsComplete

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleBack = () => {
    if (step === 1) {
      navigate(ROUTES.signup)
      return
    }
    setStep((current) => (current - 1) as SignupStep)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canContinue) return

    if (step < 3) {
      setStep((current) => (current + 1) as SignupStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const userRole = role === 'donor' ? 'DONOR' : 'ORGANIZATION'
    setAuthSession('prototype-session', userRole)
    navigate(role === 'donor' ? ROUTES.donor.home : ROUTES.organization.home)
  }

  return (
    <main className="auth-page">
      <section className="signup-page-shell">
        <header className="signup-topbar">
          <button type="button" onClick={handleBack} className="back-button" aria-label="이전 단계로 돌아가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>{step === 1 ? `${roleLabel} 회원가입` : '회원가입'}</h1>
        </header>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-form-content">
            <p className="signup-progress">
              {step} / 3 · {step === 1 ? '필수 정보' : step === 2 ? '계정 정보' : '약관 동의'}
            </p>

            {step === 1 ? (
              <SignupProfileStep
                role={role}
                fields={fields}
                values={values}
                onChange={updateValue}
              />
            ) : null}

            {step === 2 ? (
              <SignupAccountStep
                values={values}
                showPassword={showPassword}
                showPasswordConfirm={showPasswordConfirm}
                onChange={updateValue}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onTogglePasswordConfirm={() => setShowPasswordConfirm((current) => !current)}
              />
            ) : null}

            {step === 3 ? (
              <SignupAgreementStep agreements={agreements} onChange={setAgreements} />
            ) : null}
          </div>

          <div className="signup-submit-bar">
            <button type="submit" className="auth-button auth-button--primary w-full" disabled={!canContinue}>
              {step === 3 ? '가입 완료' : '다음'}
            </button>
          </div>
        </form>
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
  return (
    <>
      <h2>{role === 'donor' ? '기부자 정보를 알려 주세요' : '기관 정보를 알려 주세요'}</h2>
      <p className="signup-step-description">
        {role === 'donor' ? '이름·생년월일·이메일·전화번호는 필수예요.' : '아래 정보는 모두 필수예요.'}
      </p>
      <div className="signup-field-list">
        {fields.map((field) => (
          <div key={field.name}>
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
        ))}
      </div>
    </>
  )
}

type SignupAccountStepProps = {
  values: Record<string, string>
  showPassword: boolean
  showPasswordConfirm: boolean
  onChange: (name: string, value: string) => void
  onTogglePassword: () => void
  onTogglePasswordConfirm: () => void
}

function SignupAccountStep({ values, showPassword, showPasswordConfirm, onChange, onTogglePassword, onTogglePasswordConfirm }: SignupAccountStepProps) {
  const passwordsDiffer = Boolean(values.passwordConfirm) && values.password !== values.passwordConfirm

  return (
    <>
      <h2>나눔을 시작해 볼까요?</h2>
      <p className="signup-step-description">사용할 계정 정보를 입력해 주세요.</p>
      <div className="signup-field-list">
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
      <h2>약관을 확인해 주세요</h2>
      <p className="signup-step-description">안전한 나눔을 위해 필요한 동의예요.</p>
      <label className="agreement-all">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(event) => {
            const checked = event.target.checked
            onChange(Object.fromEntries(agreementItems.map((item) => [item.name, checked])))
          }}
        />
        <strong>전체 동의</strong>
      </label>
      <div className="agreement-list">
        {agreementItems.map((item) => (
          <label key={item.name}>
            <input
              type="checkbox"
              checked={Boolean(agreements[item.name])}
              onChange={(event) => onChange({ ...agreements, [item.name]: event.target.checked })}
            />
            <span>{item.required ? '[필수]' : '[선택]'} {item.label}</span>
          </label>
        ))}
      </div>
    </>
  )
}
