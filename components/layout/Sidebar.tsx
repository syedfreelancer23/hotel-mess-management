'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    label: 'New Entry',
    href: '/entries/new',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    label: 'All Entries',
    href: '/entries',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    ),
  },
]

interface SidebarProps {
  userRole?: number
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const visibleNavItems =
    userRole === 2
      ? navItems.filter((item) => item.href === '/entries/new')
      : navItems

  return (
    <aside className="warm-app-sidebar fixed inset-y-0 left-0 z-30 w-64 hidden lg:flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[#ead9c4]">
        <div className="w-8 h-8 rounded-lg bg-[#bf6f43] text-[#fff8ef] flex items-center justify-center flex-shrink-0 shadow-sm">
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
        <div>
          <p className="font-semibold text-[#3f342d] text-sm leading-tight">
            Hotel Mess
          </p>
          <p className="text-xs text-[#8b7869] leading-tight">Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 py-1 text-xs font-semibold text-[#907b6b] uppercase tracking-wider mb-2">
          Menu
        </p>
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === '/entries'
              ? pathname === '/entries'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`warm-nav-link ${
                isActive
                  ? 'warm-nav-link-active'
                  : ''
              }`}
            >
              <svg
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-[#8d4f31]' : 'text-[#9b8a7e]'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#ead9c4]">
        <p className="text-xs text-[#907b6b] text-center">
          Hotel Mess Management v1.0
        </p>
      </div>
    </aside>
  )
}
