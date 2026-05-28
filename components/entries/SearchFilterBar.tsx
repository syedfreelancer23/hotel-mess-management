'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'

interface SearchFilterBarProps {
  defaultSearch?: string
  defaultMealType?: string
  defaultStatus?: string
}

export default function SearchFilterBar({
  defaultSearch,
  defaultMealType,
  defaultStatus,
}: SearchFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildQuery = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      params.delete('page') // reset to page 1
      return params.toString()
    },
    [searchParams]
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      router.push(`${pathname}?${buildQuery({ search: value })}`)
    }, 400)
  }

  function handleMealType(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`${pathname}?${buildQuery({ meal_type: e.target.value })}`)
  }

  function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`${pathname}?${buildQuery({ status: e.target.value })}`)
  }

  function handleClearAll() {
    router.push(pathname)
  }

  const hasFilters = defaultSearch || defaultMealType || defaultStatus

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            defaultValue={defaultSearch}
            onChange={handleSearch}
            placeholder="Search by name or phone…"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Meal Type Filter */}
        <select
          defaultValue={defaultMealType ?? ''}
          onChange={handleMealType}
          className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors bg-white"
        >
          <option value="">All Meal Types</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Full Board">Full Board</option>
        </select>

        {/* Status Filter */}
        <select
          defaultValue={defaultStatus ?? ''}
          onChange={handleStatus}
          className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Clear Button */}
        {hasFilters && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
