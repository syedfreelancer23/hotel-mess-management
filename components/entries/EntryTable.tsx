'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toggleEntryStatus } from '@/app/actions/entries'
import type { HotelMessEntry } from '@/types'

interface EntryTableProps {
  entries: HotelMessEntry[]
}

export default function EntryTable({ entries }: EntryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="warm-surface">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <svg
            className="w-14 h-14 text-[#c7b7a8] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-[#6f6056] font-medium">No entries found</p>
          <p className="text-[#8d7d71] text-sm mt-1">
            Try adjusting your search or filters, or{' '}
            <Link
              href="/entries/new"
              className="warm-link"
            >
              create a new entry
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block warm-surface overflow-hidden">
        <table className="w-full text-sm warm-data-table">
          <thead>
            <tr className="border-b border-[#ead9c4]">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Guest
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Meal Type
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Plan
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Persons
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Created
              </th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-[#7c6d62] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efe2d0]">
            {entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  )
}

// ── Desktop Row ───────────────────────────────────────────────────────────────

function EntryRow({ entry }: { entry: HotelMessEntry }) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(entry.status)

  function handleToggle() {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    startTransition(async () => {
      const res = await toggleEntryStatus(entry.id, newStatus)
      if (!res.error) setCurrentStatus(newStatus)
    })
  }

  return (
    <tr className="transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="warm-avatar w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {entry.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#3f342d] truncate max-w-[160px]">
              {entry.full_name}
            </p>
            <p className="text-xs text-[#8c7a6f]">{entry.phone_number}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-[#66574c]">{entry.meal_type}</td>
      <td className="px-4 py-4">
        <span className="warm-chip warm-chip-neutral">
          {entry.mess_plan_type}
        </span>
      </td>
      <td className="px-4 py-4 text-[#66574c]">{entry.number_of_persons}</td>
      <td className="px-4 py-4">
        <span
          className={`warm-chip ${
            currentStatus === 'Active'
              ? 'warm-chip-active'
              : 'warm-chip-inactive'
          }`}
        >
          {currentStatus}
        </span>
      </td>
      <td className="px-4 py-4 text-xs text-[#8c7a6f]">
        {new Date(entry.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/entries/${entry.id}`}
            className="text-xs font-medium warm-link"
          >
            View
          </Link>
          <span className="text-[#d8c8b7]">|</span>
          <Link
            href={`/entries/${entry.id}/edit`}
            className="text-xs font-medium text-[#7f6f64] hover:text-[#5f5045]"
          >
            Edit
          </Link>
          <span className="text-[#d8c8b7]">|</span>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`text-xs font-medium disabled:opacity-50 ${
              currentStatus === 'Active'
                ? 'text-[#af594b] hover:text-[#954639]'
                : 'text-[#4f7b58] hover:text-[#3f6448]'
            }`}
          >
            {currentStatus === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Mobile Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: HotelMessEntry }) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(entry.status)

  function handleToggle() {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    startTransition(async () => {
      const res = await toggleEntryStatus(entry.id, newStatus)
      if (!res.error) setCurrentStatus(newStatus)
    })
  }

  return (
    <div className="warm-surface p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="warm-avatar w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
            {entry.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#3f342d] truncate">{entry.full_name}</p>
            <p className="text-xs text-[#8c7a6f]">{entry.phone_number}</p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 warm-chip ${
            currentStatus === 'Active'
              ? 'warm-chip-active'
              : 'warm-chip-inactive'
          }`}
        >
          {currentStatus}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="warm-chip warm-chip-neutral">
          {entry.meal_type}
        </span>
        <span className="warm-chip warm-chip-neutral">
          {entry.mess_plan_type}
        </span>
        <span className="warm-chip warm-chip-neutral">
          {entry.number_of_persons} person{entry.number_of_persons !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#ead9c4]">
        <p className="text-xs text-[#8c7a6f]">
          {new Date(entry.created_at).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/entries/${entry.id}`}
            className="text-xs font-medium warm-link"
          >
            View
          </Link>
          <Link
            href={`/entries/${entry.id}/edit`}
            className="text-xs font-medium text-[#7f6f64]"
          >
            Edit
          </Link>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`text-xs font-medium disabled:opacity-50 ${
              currentStatus === 'Active' ? 'text-[#af594b]' : 'text-[#4f7b58]'
            }`}
          >
            {currentStatus === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  )
}
