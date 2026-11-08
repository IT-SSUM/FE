import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { formatCountdown } from '@/features/auth/signup/date'
import type { SignupRole, SignupValues } from '@/features/auth/signup/types'

type SignupAccountStepProps = {
  role: SignupRole
  values: SignupValues
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

export function SignupAccountStep({
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
