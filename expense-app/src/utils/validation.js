/**
 * Shared react-hook-form validation rules.
 */

export const emailRules = {
  required: 'Email address is required',
  pattern: {
    value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter a valid email address',
  },
}

export const passwordRules = {
  required:  'Password is required',
  minLength: { value: 8, message: 'Password must be at least 8 characters' },
}

export const strongPasswordRules = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Minimum 8 characters' },
  validate: {
    hasUppercase: (v) => /[A-Z]/.test(v)   || 'Include at least one uppercase letter',
    hasNumber:    (v) => /\d/.test(v)       || 'Include at least one number',
    hasSpecial:   (v) => /[^A-Za-z0-9]/.test(v) || 'Include at least one special character',
  },
}

export const nameRules = {
  required:  'Full name is required',
  minLength: { value: 2,  message: 'Name must be at least 2 characters' },
  maxLength: { value: 60, message: 'Name must be under 60 characters' },
  pattern: {
    value:   /^[A-Za-z\s\-']+$/,
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  },
}

export const countryRules = {
  required: 'Please select your country',
}

/**
 * Password strength meter (0–4).
 */
export function passwordStrength(password = '') {
  let score = 0
  if (password.length >= 8)           score++
  if (password.length >= 12)          score++
  if (/[A-Z]/.test(password))         score++
  if (/\d/.test(password))            score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(4, score)
}

export const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
export const STRENGTH_COLORS = ['', 'text-red-400', 'text-amber-400', 'text-brand-400', 'text-emerald-400']
export const STRENGTH_BAR    = ['', 'bg-red-500', 'bg-amber-500', 'bg-brand-500', 'bg-emerald-500']
