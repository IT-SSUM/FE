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
    <div className="min-h-dvh bg-black">
      <main className="mx-auto min-h-dvh w-full max-w-[393px] bg-surface-canvas">
        <Outlet />
      </main>
    </div>
  )
}
