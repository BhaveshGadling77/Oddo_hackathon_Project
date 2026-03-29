import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/ui/index.jsx'

// ── Shared shell ──────────────────────────────────────────────────────────
function ErrorShell({ code, title, description, children }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #2d54f5 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 text-center max-w-md animate-fade-up">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
          <Logo size={32} />
          <span className="font-bold text-lg text-gradient">ExpenseFlow</span>
        </Link>

        <div className="font-mono text-8xl font-black text-gradient mb-4 leading-none">
          {code}
        </div>

        <h1 className="text-xl font-bold text-brand-50 mb-2">{title}</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">
          {description}
        </p>

        {children}
      </div>
    </div>
  )
}

// ── 401 / Unauthorized ────────────────────────────────────────────────────
export function Unauthorized() {
  const navigate = useNavigate()
  const { role }  = useAuth()

  return (
    <ErrorShell
      code="401"
      title="Access Denied"
      description="You don't have permission to view this page. Please contact your administrator if you believe this is a mistake."
    >
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary !w-auto px-5"
        >
          ← Go back
        </button>
        <Link to="/dashboard" className="btn-primary !w-auto px-5">
          Dashboard
        </Link>
      </div>
      <p className="mt-6 text-xs text-[var(--text-subtle)]">
        Current role:{' '}
        <span className="font-mono text-brand-400">{role ?? 'unauthenticated'}</span>
      </p>
    </ErrorShell>
  )
}

// ── 404 / Not Found ───────────────────────────────────────────────────────
export default function NotFound() {
  return (
    <ErrorShell
      code="404"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved. Double-check the URL or head back home."
    >
      <div className="flex items-center justify-center gap-3">
        <Link to="/dashboard" className="btn-primary !w-auto px-5">
          Back to Dashboard
        </Link>
      </div>
    </ErrorShell>
  )
}
