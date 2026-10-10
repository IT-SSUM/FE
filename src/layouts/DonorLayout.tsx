import { Outlet } from 'react-router-dom'

export function DonorLayout() {
  return (
    <div className="min-h-dvh bg-black">
      <main className="mx-auto min-h-dvh w-full max-w-[393px] bg-surface-canvas">
        <Outlet />
      </main>
    </div>
  )
}
