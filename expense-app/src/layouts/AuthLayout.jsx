import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/index.jsx'

/**
 * Shared layout for Login / Signup pages.
 * Features animated background orbs and the app branding.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* ── Decorative background ── */}
      <div
        className="bg-orb w-[600px] h-[600px] opacity-20"
        style={{
          top: '-200px',
          right: '-100px',
          background: 'radial-gradient(circle, #2d54f5 0%, transparent 70%)',
        }}
      />
      <div
        className="bg-orb w-[400px] h-[400px] opacity-10"
        style={{
          bottom: '-150px',
          left: '-100px',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          animationDelay: '3s',
        }}
      />

      {/* ── Grid overlay ── */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8 group">
          <Logo size={40} />
          <div>
            <span className="font-bold text-xl text-gradient tracking-tight">ExpenseFlow</span>
            <p className="text-[10px] text-[var(--text-subtle)] font-mono uppercase tracking-widest -mt-0.5">
              Reimbursement Platform
            </p>
          </div>
        </Link>

        {children}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--text-subtle)]">
          © {new Date().getFullYear()} ExpenseFlow. All rights reserved.
        </p>
      </div>
    </div>
  )
}
