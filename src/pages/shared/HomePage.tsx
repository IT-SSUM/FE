import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import mascot from '@/assets/images/mascot/mascot.svg'
import logo from '@/assets/logo/logo.svg'

export function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1300)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-dvh bg-[#eaf2ed]">
      {showSplash ? (
        <section className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col items-center justify-center gap-6 bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]" aria-label="시작 화면">
          <div className="flex items-center justify-center" aria-hidden>
            <img src={mascot} alt="" className="w-[clamp(132px,14vw,190px)] origin-bottom animate-splash-boing motion-reduce:animate-none" />
          </div>
          <img src={logo} alt="IT:SSUM" className="w-[clamp(174px,19vw,233px)] animate-splash-logo motion-reduce:animate-none" />
        </section>
      ) : (
        <section className="mx-auto flex min-h-dvh w-full max-w-[393px] animate-auth-in flex-col items-center justify-between bg-surface-canvas px-5 pb-11 min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
          <div className="my-auto flex flex-col items-center gap-6 pt-14">
            <img src={mascot} alt="IT:SSUM 상자 마스코트" className="w-[150px]" />
            <img src={logo} alt="IT:SSUM" className="w-[233px]" />
          </div>

          <div className="grid w-full gap-3.5">
            <Link to={ROUTES.login} className="inline-flex h-[52px] items-center justify-center rounded-[14px] border border-primary-700 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:border-primary-800 hover:bg-primary-800">
              로그인
            </Link>
            <Link to={ROUTES.signup} className="inline-flex h-[52px] items-center justify-center rounded-[14px] border border-neutral-300 bg-white px-5 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100">
              회원가입
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
