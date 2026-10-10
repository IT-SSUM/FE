import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuthSession, type UserRole } from '@/routes/authSession'
import { ROUTES } from '@/routes/paths'

type ProtectedRouteProps = {
  allowedRoles?: readonly UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { token, role } = getAuthSession()

  if (!token) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    const fallback =
      role === 'ORGANIZATION'
        ? ROUTES.organization.home
        : role === 'DONOR'
          ? ROUTES.donor.home
          : ROUTES.start

    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
