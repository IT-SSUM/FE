import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import mascot from '@/assets/images/mascot/mascot.svg'

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
    <main className="min-h-dvh bg-[#eaf2ed]">
      <section className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <header className="flex h-[72px] items-center px-5">
          <button
            type="button"
            onClick={() => navigate(ROUTES.start)}
            className="inline-flex size-10 items-center justify-center rounded-full border-0 bg-transparent text-primary-700 hover:bg-primary-100"
            aria-label="시작 화면으로 돌아가기"
          >
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1 className="ml-2 text-base font-semibold leading-6">로그인</h1>
        </header>

        <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="px-5 pb-6 pt-2">
            <div className="flex h-[120px] w-full items-center justify-center rounded-control bg-error-bg">
              <img src={mascot} alt="IT:SSUM 상자 마스코트" className="w-28" />
            </div>

            <h2 className="mt-5 text-2xl font-bold leading-8">다시 만나 반가워요</h2>
            <p className="mb-6 mt-4 text-sm font-medium leading-5 text-neutral-700">필요한 곳으로 나눔을 이어가요.</p>

            <label htmlFor="login-email" className="mb-2 block text-sm font-medium leading-5 text-neutral-900">이메일</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력해 주세요"
              className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label htmlFor="login-password" className="mb-2 mt-5 block text-sm font-medium leading-5 text-neutral-900">비밀번호</label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="비밀번호를 입력해 주세요"
                className="h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 pr-12 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-600 focus:border-primary-700 focus:ring-3 focus:ring-primary-700/10 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-[5px] top-1/2 inline-flex size-[42px] -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent text-primary-700"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden size={18} strokeWidth={1.8} /> : <Eye aria-hidden size={18} strokeWidth={1.8} />}
              </button>
            </div>

            <div className="mt-6 min-h-28 rounded-control border border-neutral-200 bg-primary-100 p-4">
              <p className="text-base font-bold leading-6">기관 담당자이신가요?</p>
              <span className="mt-2 block text-sm leading-5 text-neutral-700">기관 계정으로 로그인하면 신청과 수령 내역을 확인할 수 있어요.</span>
            </div>
          </div>

          <div className="mt-auto border-t border-neutral-200 bg-surface-canvas px-5 py-4">
            <button type="submit" className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] border border-primary-700 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:border-primary-800 hover:bg-primary-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500" disabled={!isFormComplete}>
              로그인
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
