import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const donorNavItems = [
  { to: ROUTES.donor.home, label: '기부자 홈' },
  { to: ROUTES.donor.donationNew, label: '물품 등록' },
  { to: ROUTES.donor.needList, label: '필요 물품' },
  { to: ROUTES.donor.myPage, label: '마이페이지' },
]

export function DonorLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <strong className="text-lg text-emerald-700">ISSUM 기부자</strong>
          <nav className="flex gap-3 text-sm text-slate-600">
            {donorNavItems.map((item) => (
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
