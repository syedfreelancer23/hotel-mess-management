'use client'

import { useState, useTransition } from 'react'
import { toggleEntryStatus } from '@/app/actions/entries'

interface ToggleStatusButtonProps {
  id: string
  currentStatus: 'Active' | 'Inactive'
}

export default function ToggleStatusButton({
  id,
  currentStatus,
}: ToggleStatusButtonProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    const newStatus = status === 'Active' ? 'Inactive' : 'Active'
    startTransition(async () => {
      const res = await toggleEntryStatus(id, newStatus)
      if (res.error) {
        setError(res.error)
      } else {
        setStatus(newStatus)
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          status === 'Active'
            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {isPending ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : status === 'Active' ? (
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
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        ) : (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {status === 'Active' ? 'Mark Inactive' : 'Mark Active'}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
