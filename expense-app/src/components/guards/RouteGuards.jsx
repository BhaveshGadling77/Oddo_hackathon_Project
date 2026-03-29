import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, ROLES } from '../../context/AuthContext.jsx'
import LoadingScreen from '../ui/LoadingScreen.jsx'

// ── ProtectedRoute ─────────────────────────────────────────────────────────
// Requires the user to be authenticated. Redirects to /login otherwise.
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

// ── AdminRoute ─────────────────────────────────────────────────────────────
// Requires role === 'admin'.
export function AdminRoute() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

// ── ManagerRoute ───────────────────────────────────────────────────────────
// Requires role === 'manager' OR 'admin'.
export function ManagerRoute() {
  const { isManager, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  if (!isManager) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

// ── EmployeeRoute ──────────────────────────────────────────────────────────
// Any authenticated user may access these routes.
export function EmployeeRoute() {
  const { isEmployee, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  if (!isEmployee) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

// ── GuestRoute ─────────────────────────────────────────────────────────────
// Redirect authenticated users away from auth pages.
export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
