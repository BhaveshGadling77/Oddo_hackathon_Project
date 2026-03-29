import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Spinner, EyeIcon, AlertIcon, CheckIcon } from '../../components/ui/index.jsx'
import {
  emailRules,
  strongPasswordRules,
  nameRules,
  countryRules,
  passwordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
  STRENGTH_BAR,
} from '../../utils/validation.js'
import { useCountries } from '../../hooks/useCountries.js'
import GoogleSignInButton from '../../components/forms/GoogleSignInButton.jsx'

export default function SignupPage() {
  const { signup, googleLogin, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess]           = useState(false)
  const [pwValue, setPwValue]           = useState('')

  const { countries, isLoading: countriesLoading } = useCountries()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  // Watch password for strength meter
  const watchedPassword = watch('password', '')
  const strength = passwordStrength(watchedPassword)

  const onSubmit = async (data) => {
    clearError()
    const { confirmPassword, ...payload } = data
    const result = await signup(payload)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 600)
    }
  }

  const handleGoogleLogin = async (credential) => {
    const result = await googleLogin(credential)
    if (result.success) navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-brand-50 leading-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Start submitting and tracking expenses in minutes
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
            <span>Account created! Setting up your workspace…</span>
          </div>
        )}

        {/* Google first */}
        <GoogleSignInButton onCredential={handleGoogleLogin} disabled={isLoading} label="Sign up with Google" />

        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Full name */}
          <div>
            <label htmlFor="name" className="form-label">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className={`form-input ${errors.name ? 'error' : ''}`}
              {...register('name', nameRules)}
            />
            {errors.name && (
              <p className="field-error"><AlertIcon />{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@company.com"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email', emailRules)}
            />
            {errors.email && (
              <p className="field-error"><AlertIcon />{errors.email.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="form-label">Country</label>
            <div className="relative">
              <select
                id="country"
                className={`form-input appearance-none pr-9 ${errors.country ? 'error' : ''} ${countriesLoading ? 'opacity-60' : ''}`}
                defaultValue=""
                disabled={countriesLoading}
                {...register('country', countryRules)}
              >
                <option value="" disabled>
                  {countriesLoading ? 'Loading countries…' : 'Select your country'}
                </option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                {countriesLoading ? (
                  <Spinner size={14} />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </div>
            </div>
            {errors.country && (
              <p className="field-error"><AlertIcon />{errors.country.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className={`form-input pr-11 ${errors.password ? 'error' : ''}`}
                {...register('password', strongPasswordRules)}
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

            {/* Strength meter */}
            {watchedPassword.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? STRENGTH_BAR[strength] : 'bg-surface-border'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${STRENGTH_COLORS[strength]}`}>
                  {STRENGTH_LABELS[strength]}
                  {strength < 3 && (
                    <span className="text-[var(--text-subtle)] font-normal ml-1">
                      — add uppercase, numbers & symbols
                    </span>
                  )}
                </p>
              </div>
            )}

            {errors.password && (
              <p className="field-error mt-1"><AlertIcon />{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="field-error"><AlertIcon />{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded bg-surface border border-surface-border accent-brand-500 cursor-pointer shrink-0"
              {...register('terms', { required: 'You must accept the terms to continue' })}
            />
            <label htmlFor="terms" className="text-xs text-[var(--text-muted)] cursor-pointer leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="field-error -mt-2"><AlertIcon />{errors.terms.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading || success}
            className="btn-primary mt-2"
          >
            {isSubmitting || isLoading ? (
              <><Spinner size={16} />Creating account…</>
            ) : success ? (
              <><CheckIcon />Account created!</>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
