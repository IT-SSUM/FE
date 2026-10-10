import { Outlet } from 'react-router-dom'

export function DonorLayout() {
  return (
    <div className="app-viewport">
      <main className="app-frame">
        <Outlet />
      </main>
    </div>
  )
}
