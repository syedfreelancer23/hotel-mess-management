'use client'

import { signOut } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'

interface HeaderProps {
  userName: string
  userRole?: number
}

export default function Header({ userName, userRole }: HeaderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  const isStatusScoped = pathname.startsWith('/entries') && statusFilter
  const exportHref = isStatusScoped
    ? `/api/entries/export?status=${encodeURIComponent(statusFilter)}`
    : '/api/entries/export'

  return (
    <header className="warm-app-header">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile brand */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#bf6f43] text-[#fff8ef] flex items-center justify-center shadow-sm">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span className="font-semibold text-[#3f342d] text-sm">Hotel Mess</span>
        </div>

        {/* Spacer on desktop */}
        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {userRole === 1 && (
            <a
              href={exportHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9c3a8] bg-[#fff2e2] px-3 py-1.5 text-xs font-medium text-[#7a5b48] hover:bg-[#ffe8cf] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14"
                />
              </svg>
              Download Excel
            </a>
          )}

          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f2dec8] flex items-center justify-center text-[#8d4f31] font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <p className="hidden md:block text-sm font-medium text-[#3f342d]">
              {userName}
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/logout' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7d8c4] bg-[#fff8ef] px-3 py-1.5 text-xs font-medium text-[#6f6056] hover:bg-[#fff1e0] hover:text-[#9c4f43] hover:border-[#dfb6ac] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
