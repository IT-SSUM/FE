import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const organizationNavItems = [
  { to: ROUTES.organization.home, label: '기관 홈' },
  { to: ROUTES.organization.needNew, label: '필요 물품 등록' },
  { to: ROUTES.organization.donationList, label: '기부 물품' },
  { to: ROUTES.organization.myPage, label: '마이페이지' },
]

export function OrganizationLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <strong className="text-lg text-emerald-700">ISSUM 기관</strong>
          <nav className="flex gap-3 text-sm text-slate-600">
            {organizationNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-emerald-700' : ''
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
