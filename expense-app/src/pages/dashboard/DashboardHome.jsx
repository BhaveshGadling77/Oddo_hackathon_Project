import { useAuth, ROLES } from '../../context/AuthContext.jsx'

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, icon, color, delay = 0 }) {
  const colors = {
    blue:    { bg: 'bg-brand-500/10',   border: 'border-brand-500/20',  icon: 'text-brand-400',   text: 'text-brand-300' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', text: 'text-emerald-300' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  icon: 'text-amber-400',   text: 'text-amber-300' },
    rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',   icon: 'text-rose-400',    text: 'text-rose-300' },
  }
  const c = colors[color] ?? colors.blue

  return (
    <div
      className={`relative ${c.bg} border ${c.border} rounded-2xl p-5 overflow-hidden animate-fade-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {delta !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            delta >= 0
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          }`}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-brand-50 mb-1">{value}</p>
      <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
    </div>
  )
}

// ── Recent expense row ─────────────────────────────────────────────────────
function ExpenseRow({ title, amount, category, status, date }) {
  const statusConfig = {
    approved: { label: 'Approved', cls: 'badge-success' },
    pending:  { label: 'Pending',  cls: 'badge-warning' },
    rejected: { label: 'Rejected', cls: 'badge-error' },
    draft:    { label: 'Draft',    cls: 'badge-info' },
  }
  const s = statusConfig[status] ?? statusConfig.pending

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-surface-border last:border-0 group hover:bg-surface-hover/50 -mx-4 px-4 rounded-xl transition-all duration-150">
      <div className="w-9 h-9 rounded-xl bg-surface-border flex items-center justify-center shrink-0 text-[var(--text-muted)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 14l6-6m0 0H9m6 0v6M3 6h18M3 10h18M3 14h4M3 18h4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-50 truncate">{title}</p>
        <p className="text-xs text-[var(--text-subtle)]">{category} · {date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-brand-50">{amount}</p>
        <span className={`text-[10px] ${s.cls} px-1.5 py-0.5 rounded-full font-semibold`}>
          {s.label}
        </span>
      </div>
    </div>
  )
}

// ── Quick action card ──────────────────────────────────────────────────────
function QuickAction({ label, description, icon, color, to }) {
  const colors = {
    blue:    'from-brand-500/20 to-brand-600/10 border-brand-500/25 hover:border-brand-400/50',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/25 hover:border-emerald-400/50',
    amber:   'from-amber-500/20 to-amber-600/10 border-amber-500/25 hover:border-amber-400/50',
    violet:  'from-violet-500/20 to-violet-600/10 border-violet-500/25 hover:border-violet-400/50',
  }

  return (
    <a
      href={to}
      className={`flex items-center gap-3 p-4 rounded-2xl border bg-gradient-to-br ${colors[color] ?? colors.blue}
                  transition-all duration-200 cursor-pointer group hover:-translate-y-0.5`}
    >
      <div className="text-lg">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-brand-50">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className="ml-auto text-[var(--text-subtle)] group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </a>
  )
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const MOCK_EXPENSES = [
  { title: 'Flight to Delhi — Q1 Conference',     amount: '₹18,450', category: 'Travel',     status: 'approved', date: 'Mar 25, 2026' },
  { title: 'Team Lunch — Client Visit',            amount: '₹3,200',  category: 'Meals',      status: 'pending',  date: 'Mar 22, 2026' },
  { title: 'SaaS Subscription — Figma Pro',        amount: '₹1,500',  category: 'Software',   status: 'approved', date: 'Mar 18, 2026' },
  { title: 'Taxi — Airport Transfer',              amount: '₹850',    category: 'Transport',  status: 'rejected', date: 'Mar 15, 2026' },
  { title: 'Office Supplies — Stationery',         amount: '₹620',    category: 'Office',     status: 'draft',    date: 'Mar 12, 2026' },
]

const EMPLOYEE_STATS = [
  { label: 'Total Submitted',    value: '₹28,640', delta: 12,  color: 'blue',    icon: '💳' },
  { label: 'Approved',           value: '₹19,950', delta: 8,   color: 'emerald', icon: '✅' },
  { label: 'Pending Review',     value: '₹3,200',  delta: null, color: 'amber',  icon: '⏳' },
  { label: 'Rejected',           value: '₹850',    delta: -5,  color: 'rose',    icon: '❌' },
]

const MANAGER_STATS = [
  { label: 'Pending Approvals',  value: '14',       delta: 3,   color: 'amber',   icon: '⏳' },
  { label: 'Approved This Month', value: '₹1.4L',   delta: 18,  color: 'emerald', icon: '✅' },
  { label: 'Total Team Spend',   value: '₹4.2L',    delta: 7,   color: 'blue',    icon: '📊' },
  { label: 'Avg Processing Time', value: '1.8 days', delta: -12, color: 'rose',   icon: '⚡' },
]

const ADMIN_STATS = [
  { label: 'Total Employees',    value: '142',      delta: 4,   color: 'blue',    icon: '👥' },
  { label: 'Monthly Spend',      value: '₹12.8L',   delta: 9,   color: 'emerald', icon: '💰' },
  { label: 'Open Requests',      value: '38',       delta: -5,  color: 'amber',   icon: '📋' },
  { label: 'Policy Violations',  value: '3',        delta: -40, color: 'rose',    icon: '🚨' },
]

// ── Page ───────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user, role, isAdmin, isManager } = useAuth()

  const stats = isAdmin ? ADMIN_STATS : isManager ? MANAGER_STATS : EMPLOYEE_STATS

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
        <p className="text-xs text-[var(--text-subtle)] font-mono uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-brand-50">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {isAdmin
            ? 'Here\'s a system-wide overview for today.'
            : isManager
            ? 'You have pending approvals waiting for your review.'
            : 'Track and manage your expense reimbursements.'}
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 80} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recent expenses ── */}
        <div
          className="lg:col-span-2 bg-surface-card border border-surface-border rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: '320ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-brand-50">Recent Expenses</h2>
            <a href="/expenses" className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
              View all →
            </a>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-4">Your latest submitted claims</p>
          <div>
            {MOCK_EXPENSES.map((e) => (
              <ExpenseRow key={e.title} {...e} />
            ))}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div
          className="space-y-3 animate-fade-up"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          <div>
            <h2 className="text-sm font-bold text-brand-50 mb-0.5">Quick Actions</h2>
            <p className="text-xs text-[var(--text-muted)] mb-3">Common tasks at a glance</p>
          </div>

          <QuickAction
            label="New Expense"
            description="Submit a reimbursement"
            icon="➕"
            color="blue"
            to="/expenses/new"
          />

          {isManager && (
            <QuickAction
              label="Review Approvals"
              description="14 requests pending"
              icon="✅"
              color="amber"
              to="/approvals"
            />
          )}

          <QuickAction
            label="View Reports"
            description="Spending analytics"
            icon="📊"
            color="violet"
            to="/reports"
          />

          {isAdmin && (
            <QuickAction
              label="Manage Users"
              description="Roles & permissions"
              icon="👥"
              color="emerald"
              to="/admin/users"
            />
          )}

          {/* Policy reminder */}
          <div className="p-4 rounded-2xl bg-surface border border-surface-border mt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📋</span>
              <p className="text-xs font-semibold text-brand-50">Expense Policy</p>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Meals cap: <span className="text-brand-300 font-semibold">₹2,000/day</span>.
              Travel must be pre-approved over <span className="text-brand-300 font-semibold">₹10,000</span>.
            </p>
            <a href="/policy" className="text-[10px] text-brand-400 hover:text-brand-300 mt-2 inline-block transition-colors">
              Read full policy →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
