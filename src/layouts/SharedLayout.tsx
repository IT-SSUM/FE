import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function SharedLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to={ROUTES.root} className="text-lg font-semibold text-emerald-700">
            ISSUM
          </Link>
          <nav className="flex gap-3 text-sm text-slate-600">
            <Link to={ROUTES.chatList}>채팅</Link>
            <Link to={ROUTES.notifications}>알림</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
