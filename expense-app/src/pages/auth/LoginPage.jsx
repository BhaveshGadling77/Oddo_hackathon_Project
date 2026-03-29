import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Spinner, EyeIcon, AlertIcon, CheckIcon } from '../../components/ui/index.jsx'
import { emailRules, passwordRules } from '../../utils/validation.js'
import GoogleSignInButton from '../../components/forms/GoogleSignInButton.jsx'

export default function LoginPage() {
  const { login, googleLogin, isLoading, error, clearError } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname ?? '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess]           = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  const onSubmit = async (data) => {
    clearError()
    const result = await login(data)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => navigate(from, { replace: true }), 500)
    }
  }

  const handleGoogleLogin = async (credential) => {
    const result = await googleLogin(credential)
    if (result.success) navigate(from, { replace: true })
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-brand-50 leading-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Sign in to manage your expense reimbursements
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div className="alert-error mb-5 animate-fade-in">
            <AlertIcon className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="alert-success mb-5 animate-fade-in">
            <CheckIcon className="shrink-0" />
            <span>Signed in successfully. Redirecting…</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email', emailRules)}
            />
            {errors.email && (
              <p className="field-error">
                <AlertIcon />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="form-label mb-0">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`form-input pr-11 ${errors.password ? 'error' : ''}`}
                {...register('password', passwordRules)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-brand-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={!showPassword} />
              </button>
            </div>
            {errors.password && (
              <p className="field-error">
                <AlertIcon />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2.5">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded bg-surface border border-surface-border accent-brand-500 cursor-pointer"
              {...register('remember')}
            />
            <label htmlFor="remember" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
              Keep me signed in for 30 days
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading || success}
            className="btn-primary mt-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Spinner size={16} />
                Signing in…
              </>
            ) : success ? (
              <>
                <CheckIcon />
                Signed in!
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Google */}
        <GoogleSignInButton onCredential={handleGoogleLogin} disabled={isLoading} />

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
          >
            Create one free
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
