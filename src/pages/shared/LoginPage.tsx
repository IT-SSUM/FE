import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import mascot from '@/assets/images/mascot/mascot.svg'
import { ROUTES } from '@/constants/routes'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const isFormComplete = email.trim().length > 0 && password.length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormComplete) return
    navigate(ROUTES.donor.home)
  }

  return (
    <main className="auth-page">
      <section className="login-page-shell">
        <header className="login-topbar">
          <button type="button" onClick={() => navigate(-1)} className="back-button" aria-label="뒤로 가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>로그인</h1>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-content">
            <div className="login-mascot-panel">
              <img src={mascot} alt="IT:SSUM 상자 마스코트" />
            </div>

            <h2>다시 만나 반가워요</h2>
            <p className="login-form-description">필요한 곳으로 나눔을 이어가요.</p>

            <label htmlFor="login-email" className="auth-field-label">이메일</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력해 주세요"
              className="auth-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label htmlFor="login-password" className="auth-field-label mt-5">비밀번호</label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="비밀번호를 입력해 주세요"
                className="auth-input pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="password-toggle"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden size={18} strokeWidth={1.8} /> : <Eye aria-hidden size={18} strokeWidth={1.8} />}
              </button>
            </div>

            <div className="organization-note">
              <p>기관 담당자이신가요?</p>
              <span>기관 계정으로 로그인하면 신청과 수령 내역을 확인할 수 있어요.</span>
            </div>
          </div>

          <div className="login-submit-bar">
            <button type="submit" className="auth-button auth-button--primary w-full" disabled={!isFormComplete}>
              로그인
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
