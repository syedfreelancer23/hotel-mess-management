'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import AppQrCode from '@/components/common/AppQrCode'

// Debug logs intentionally disabled.
// Set to true temporarily only when actively troubleshooting sign-in behavior.
const authDebugEnabled = false

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGuestPanelOpen, setIsGuestPanelOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username: username.trim(),
      password,
      callbackUrl: '/dashboard',
      redirect: false,
    })

    if (authDebugEnabled) {
      console.log('[auth-debug] Client signIn result', {
        ok: result?.ok ?? false,
        status: result?.status ?? null,
        hasError: Boolean(result?.error),
        hasUrl: Boolean(result?.url),
      })
    }

    if (result?.error || !result?.ok) {
      setError('Invalid username or password. Please try again.')
      setLoading(false)
    } else {
      // Use full-page navigation to avoid middleware/cookie timing issues on deployment.
      window.location.href = result.url ?? '/dashboard'
    }
  }

  return (
    <div className="warm-page">
      <div className="warm-shell">
        {/* Brand */}
        <div className="warm-brand">
          <div className="warm-brand-icon">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 64 64"
              aria-hidden="true"
            >
              <path
                d="M16 24c-5 0-9-4-9-9s4-9 9-9c2 0 4 1 5 2 2-3 6-5 11-5s9 2 11 5c1-1 3-2 5-2 5 0 9 4 9 9s-4 9-9 9H16z"
                fill="#fff8ef"
              />
              <path
                d="M32 59c-9 0-16-7-16-16V31h32v12c0 9-7 16-16 16z"
                fill="#ffe3be"
              />
              <path d="M22 31h20v7H22z" fill="#f6f0ea" />
              <path
                d="M18 24h28"
                stroke="#f2cfa8"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M20 31h24"
                stroke="#e9b381"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M22 53c3 3 7 4 10 4s7-1 10-4"
                stroke="#bc6d42"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="26" cy="42" r="2" fill="#8f5b3a" />
              <circle cx="38" cy="42" r="2" fill="#8f5b3a" />
              <path
                d="M16 24c-5 0-9-4-9-9s4-9 9-9c2 0 4 1 5 2 2-3 6-5 11-5s9 2 11 5c1-1 3-2 5-2 5 0 9 4 9 9s-4 9-9 9"
                stroke="#f6dfc5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="warm-heading">
            ZEE Kitchens & Bakers
          </h1>
          <p className="warm-subtext">
            Sign in to manage guest entries and meal plans
          </p>
        </div>

        {/* Card */}
        <div className="warm-card">
          {error && (
            <div className="warm-alert mb-6">
              {error}
            </div>
          )}

          <div className="warm-panel mb-6">
            <button
              type="button"
              onClick={() => setIsGuestPanelOpen((prev) => !prev)}
              className="warm-panel-toggle"
              aria-expanded={isGuestPanelOpen}
              aria-controls="guest-credentials-panel"
            >
              <span className="warm-panel-title">Guest login credentials</span>
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${isGuestPanelOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div
              id="guest-credentials-panel"
              className={`warm-panel-body transition-all duration-300 ease-in-out ${isGuestPanelOpen ? 'max-h-52 pb-3 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}
            >
              <p>
                Username: <span className="font-mono">guest</span>
              </p>
              <p>
                Password: <span className="font-mono">guest@123</span>
              </p>
            </div>
          </div>

          <div className="warm-actions mb-6">
            <button
              type="button"
              onClick={() => {
                setUsername('guest')
                setPassword('guest@123')
                setError('')
              }}
              disabled={loading}
              className="warm-btn warm-btn-secondary"
            >
              Fill Guest Credentials
            </button>

            <a
              href="https://maps.app.goo.gl/DiVEugHu5m2d4go1A?g_st=awb"
              target="_blank"
              rel="noopener noreferrer"
              className="warm-btn warm-btn-primary"
            >
              Get Directions
            </a>
          </div>

          <form onSubmit={handleSubmit} className="warm-form">
            {/* Username */}
            <div className="warm-field">
              <label
                htmlFor="username"
                className="warm-label"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="guest"
                className="warm-control"
              />
            </div>

            {/* Password */}
            <div className="warm-field">
              <label
                htmlFor="password"
                className="warm-label"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="guest@123"
                className="warm-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="warm-btn warm-btn-primary warm-submit"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* <p className="warm-note">
            Only authorized staff members can access this system.
          </p> */}
          <div className="warm-qr">
            <AppQrCode className="max-w-[240px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
