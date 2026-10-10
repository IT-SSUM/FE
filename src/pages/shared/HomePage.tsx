import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import mascot from '@/assets/images/mascot/mascot.svg'
import logo from '@/assets/logo/logo.svg'
import { ROUTES } from '@/constants/routes'

export function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1300)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="auth-page">
      {showSplash ? (
        <section className="splash-screen" aria-label="시작 화면">
          <img src={mascot} alt="" className="splash-mascot" />
          <img src={logo} alt="IT:SSUM" className="splash-logo" />
        </section>
      ) : (
        <section className="welcome-screen animate-auth-in">
          <div className="welcome-brand">
            <img src={mascot} alt="IT:SSUM 상자 마스코트" className="welcome-mascot" />
            <img src={logo} alt="IT:SSUM" className="welcome-logo" />
          </div>

          <div className="welcome-actions">
            <Link to={ROUTES.login} className="auth-button auth-button--primary">
              로그인
            </Link>
            <Link to={ROUTES.signup} className="auth-button auth-button--secondary">
              회원가입
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
