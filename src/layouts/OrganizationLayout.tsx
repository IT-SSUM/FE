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
    <div className="min-h-dvh bg-[#eaf2ed]">
      <div className="mx-auto min-h-dvh w-full max-w-[393px] overflow-x-hidden bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <header className="border-b border-neutral-200 bg-white">
          <div className="px-5 py-4">
            <strong className="text-lg text-primary-700">IT:SSUM 기관</strong>
            <nav className="mt-3 flex gap-4 overflow-x-auto whitespace-nowrap text-sm text-neutral-700">
              {organizationNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'font-semibold text-primary-700' : ''
                  }
                >
                  {item.label}
                </NavLink>
              ))}
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
