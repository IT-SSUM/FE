import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

export function SharedLayout() {
  return (
    <div className="min-h-dvh bg-[#eaf2ed]">
      <div className="mx-auto min-h-dvh w-full max-w-[393px] overflow-x-hidden bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <header className="border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <Link to={ROUTES.root} className="text-lg font-semibold text-primary-700">
              IT:SSUM
            </Link>
            <nav className="flex gap-3 text-sm text-neutral-700">
              <Link to={ROUTES.chatList}>채팅</Link>
              <Link to={ROUTES.notifications}>알림</Link>
            </nav>
          </div>
        </header>
        <main className="px-5 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
