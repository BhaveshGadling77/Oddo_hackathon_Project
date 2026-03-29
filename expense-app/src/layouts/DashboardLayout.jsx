import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, ROLES } from '../context/AuthContext.jsx'
import { Logo } from '../components/ui/index.jsx'

// ── Nav item definition ───────────────────────────────────────────────────
function navIcon(d) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const NAV_ITEMS = {
  [ROLES.EMPLOYEE]: [
    { label: 'Dashboard',  to: '/dashboard',   icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { label: 'My Expenses', to: '/expenses',   icon: 'M9 14l6-6m0 0H9m6 0v6M3 6h18M3 10h18M3 14h4M3 18h4' },
    { label: 'Profile',    to: '/profile',     icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  [ROLES.MANAGER]: [
    { label: 'Dashboard',  to: '/dashboard',   icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { label: 'My Expenses', to: '/expenses',   icon: 'M9 14l6-6m0 0H9m6 0v6M3 6h18M3 10h18M3 14h4M3 18h4' },
    { label: 'Approvals',  to: '/approvals',   icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { label: 'Reports',    to: '/reports',     icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z' },
    { label: 'Team',       to: '/team',        icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { label: 'Profile',    to: '/profile',     icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard',   to: '/dashboard',       icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { label: 'All Expenses', to: '/expenses',        icon: 'M9 14l6-6m0 0H9m6 0v6M3 6h18M3 10h18M3 14h4M3 18h4' },
    { label: 'Approvals',   to: '/approvals',        icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { label: 'Reports',     to: '/reports',          icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z' },
    { label: 'Team',        to: '/team',             icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    {
      label: 'Admin',
      to: '/admin',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 0 0 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    },
    { label: 'Profile',     to: '/profile',          icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
}

const ROLE_BADGE = {
  [ROLES.ADMIN]:    { label: 'Admin',    classes: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
  [ROLES.MANAGER]:  { label: 'Manager',  classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  [ROLES.EMPLOYEE]: { label: 'Employee', classes: 'bg-brand-500/15 text-brand-300 border-brand-500/25' },
}

export default function DashboardLayout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut]   = useState(false)

  const navItems = NAV_ITEMS[role] ?? NAV_ITEMS[ROLES.EMPLOYEE]
  const badge    = ROLE_BADGE[role] ?? ROLE_BADGE[ROLES.EMPLOYEE]

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`
        flex flex-col w-64 bg-surface-card border-r border-surface-border
        ${mobile
          ? 'fixed inset-y-0 left-0 z-50 shadow-2xl transform transition-transform duration-300 ' +
            (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
          : 'hidden lg:flex'
        }
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <Logo size={36} />
        <div>
          <span className="font-bold text-base text-brand-50 tracking-tight">ExpenseFlow</span>
          <p className="text-[9px] text-[var(--text-subtle)] font-mono uppercase tracking-widest">
            Management
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                 : 'text-[var(--text-muted)] hover:bg-surface-hover hover:text-brand-100 border border-transparent'
               }`
            }
          >
            {navIcon(item.icon)}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface border border-surface-border">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 text-xs font-bold text-brand-300 uppercase">
            {user?.name?.[0] ?? user?.email?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-50 truncate">
              {user?.name ?? 'User'}
            </p>
            <p className="text-[10px] text-[var(--text-subtle)] truncate">
              {user?.email ?? ''}
            </p>
          </div>
          {/* Role badge */}
          <span className={`role-pill border ${badge.classes} shrink-0`}>
            {badge.label}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-2 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 disabled:opacity-50"
        >
          {loggingOut ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2A10 10 0 0 1 22 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          )}
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <Sidebar mobile />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-surface-card border-b border-surface-border shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[var(--text-muted)] hover:text-brand-100 transition-colors"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Quick actions */}
          <Link
            to="/expenses/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold transition-all duration-150 shadow-glow"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Expense
          </Link>

          {/* Notifications bell */}
          <button className="relative text-[var(--text-muted)] hover:text-brand-100 transition-colors p-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full border border-surface-card" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-grid-pattern">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
