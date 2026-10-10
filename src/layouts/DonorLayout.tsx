import { Outlet } from 'react-router-dom'

export function DonorLayout() {
  return (
    <div className="min-h-dvh bg-[#eaf2ed]">
      <main className="mx-auto min-h-dvh w-full max-w-[393px] overflow-x-hidden bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <Outlet />
      </main>
    </div>
  )
}
