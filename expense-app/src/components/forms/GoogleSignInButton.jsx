import { useEffect, useRef, useState } from 'react'
import { Spinner } from '../ui/index.jsx'

/**
 * Google Sign-In button.
 *
 * In production, load the Google Identity Services (GIS) script and render
 * the real Google button. Here we render a polished UI button that:
 *  - Shows a realistic Google button appearance
 *  - Calls onCredential(mockCredential) when clicked (for dev/demo)
 *  - In production: initialise google.accounts.id and render real widget
 *
 * Props:
 *   onCredential(credential: string) — called with the Google JWT credential
 *   disabled: boolean
 *   label: string
 */
export default function GoogleSignInButton({
  onCredential,
  disabled = false,
  label = 'Continue with Google',
}) {
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef(null)

  // ── Try to load & render the real GIS button ──────────────────────────
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    // If no client ID configured, we stay in demo mode
    if (!clientId) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback:  (response) => {
          if (response.credential) onCredential(response.credential)
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type:  'standard',
          theme: 'outline',
          size:  'large',
          width: buttonRef.current.offsetWidth,
          text:  'continue_with',
        })
      }
    }

    document.head.appendChild(script)
    return () => script.remove()
  }, [onCredential])

  // ── Demo click handler (no real Google client ID configured) ──────────
  const handleDemoClick = async () => {
    if (disabled || loading) return
    setLoading(true)
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200))
    // In a real app this would be a real Google credential JWT
    await onCredential('DEMO_GOOGLE_CREDENTIAL_TOKEN')
    setLoading(false)
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // When a real clientId is set, render the GIS-managed div
  if (clientId) {
    return (
      <div
        ref={buttonRef}
        className="w-full min-h-[44px] flex items-center justify-center"
        aria-label="Sign in with Google"
      />
    )
  }

  // Demo / development button
  return (
    <button
      type="button"
      onClick={handleDemoClick}
      disabled={disabled || loading}
      className="btn-secondary"
      aria-label={label}
    >
      {loading ? (
        <Spinner size={16} className="text-[var(--text-muted)]" />
      ) : (
        <GoogleLogo />
      )}
      {loading ? 'Connecting to Google…' : label}
    </button>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        fill="#FFC107"
      />
      <path
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        fill="#FF3D00"
      />
      <path
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        fill="#4CAF50"
      />
      <path
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        fill="#1976D2"
      />
    </svg>
  )
}
