import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage  from './pages/auth/LoginPage.jsx'
import SignupPage from './pages/auth/SignupPage.jsx'
import {
  ProtectedRoute,
  AdminRoute,
  ManagerRoute,
  EmployeeRoute,
} from './components/guards/RouteGuards.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardHome   from './pages/dashboard/DashboardHome.jsx'
import Unauthorized    from './pages/Unauthorized.jsx'
import NotFound        from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome />} />

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"          element={<AdminPlaceholder />} />
            <Route path="/admin/users"    element={<AdminPlaceholder />} />
            <Route path="/admin/settings" element={<AdminPlaceholder />} />
          </Route>

          {/* Manager + Admin */}
          <Route element={<ManagerRoute />}>
            <Route path="/approvals"  element={<ManagerPlaceholder />} />
            <Route path="/reports"    element={<ManagerPlaceholder />} />
            <Route path="/team"       element={<ManagerPlaceholder />} />
          </Route>

          {/* Employee + higher roles */}
          <Route element={<EmployeeRoute />}>
            <Route path="/expenses"        element={<EmployeePlaceholder />} />
            <Route path="/expenses/new"    element={<EmployeePlaceholder />} />
            <Route path="/expenses/:id"    element={<EmployeePlaceholder />} />
          </Route>

          <Route path="/profile"   element={<EmployeePlaceholder />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// ── Placeholder pages for Part 2 ──────────────────────────────────────────
function AdminPlaceholder() {
  return <ComingSoon title="Admin Panel" description="User management, roles & system configuration." color="rose" />
}

function ManagerPlaceholder() {
  return <ComingSoon title="Manager Panel" description="Expense approvals, team reports & analytics." color="amber" />
}

function EmployeePlaceholder() {
  return <ComingSoon title="Expenses" description="Submit, track and manage your expense claims." color="blue" />
}

function ComingSoon({ title, description, color }) {
  const colors = {
    rose:  { bg: 'bg-rose-500/10',   border: 'border-rose-500/25',   text: 'text-rose-400',   dot: 'bg-rose-500' },
    amber: { bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  text: 'text-amber-400',  dot: 'bg-amber-500' },
    blue:  { bg: 'bg-brand-500/10',  border: 'border-brand-500/25',  text: 'text-brand-400',  dot: 'bg-brand-500' },
  }
  const c = colors[color]
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className={`max-w-sm w-full ${c.bg} border ${c.border} rounded-2xl p-8 text-center`}>
        <div className={`w-3 h-3 rounded-full ${c.dot} mx-auto mb-4 animate-pulse`} />
        <h2 className={`text-xl font-bold ${c.text} mb-2`}>{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
        <p className="mt-4 text-xs text-[var(--text-subtle)] font-mono">Coming in Part 2</p>
      </div>
    </div>
  )
}
