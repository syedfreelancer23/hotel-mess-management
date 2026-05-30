import Link from 'next/link'

export default function LogoutPage() {
  return (
    <div className="warm-page px-4">
      <div className="warm-shell text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f6e2d0] text-[#a85f38] shadow-sm mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        <h1 className="warm-heading mb-2">
          You have been signed out
        </h1>
        <p className="warm-subtext mb-8">
          Thank you for using Hotel Mess Management. Your session has ended
          securely.
        </p>

        <Link
          href="/login"
          className="warm-btn warm-btn-primary w-full sm:w-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14"
            />
          </svg>
          Sign in again
        </Link>
      </div>
    </div>
  )
}
