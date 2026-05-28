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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <svg
            className="w-14 h-14 text-gray-200 mb-4"
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
          <p className="text-gray-500 font-medium">No entries found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters, or{' '}
            <Link
              href="/entries/new"
              className="text-blue-600 hover:underline"
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
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Meal Type
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Persons
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
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
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
            {entry.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate max-w-[160px]">
              {entry.full_name}
            </p>
            <p className="text-xs text-gray-400">{entry.phone_number}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600">{entry.meal_type}</td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {entry.mess_plan_type}
        </span>
      </td>
      <td className="px-4 py-4 text-gray-600">{entry.number_of_persons}</td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            currentStatus === 'Active'
              ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
              : 'bg-gray-100 text-gray-500 ring-1 ring-gray-400/20'
          }`}
        >
          {currentStatus}
        </span>
      </td>
      <td className="px-4 py-4 text-xs text-gray-400">
        {new Date(entry.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/entries/${entry.id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View
          </Link>
          <span className="text-gray-200">|</span>
          <Link
            href={`/entries/${entry.id}/edit`}
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Edit
          </Link>
          <span className="text-gray-200">|</span>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`text-xs font-medium disabled:opacity-50 ${
              currentStatus === 'Active'
                ? 'text-red-500 hover:text-red-700'
                : 'text-green-600 hover:text-green-700'
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
            {entry.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{entry.full_name}</p>
            <p className="text-xs text-gray-400">{entry.phone_number}</p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            currentStatus === 'Active'
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {currentStatus}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 font-medium">
          {entry.meal_type}
        </span>
        <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 font-medium">
          {entry.mess_plan_type}
        </span>
        <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 font-medium">
          {entry.number_of_persons} person{entry.number_of_persons !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {new Date(entry.created_at).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/entries/${entry.id}`}
            className="text-xs font-medium text-blue-600"
          >
            View
          </Link>
          <Link
            href={`/entries/${entry.id}/edit`}
            className="text-xs font-medium text-gray-500"
          >
            Edit
          </Link>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`text-xs font-medium disabled:opacity-50 ${
              currentStatus === 'Active' ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {currentStatus === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  )
}
