import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchFilterBar from '@/components/entries/SearchFilterBar'
import EntryTable from '@/components/entries/EntryTable'

const PAGE_SIZE = 10

interface SearchParams {
  search?: string
  meal_type?: string
  status?: string
  page?: string
}

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  let query = supabase
    .from('hotel_mess_entries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (searchParams.search) {
    query = query.or(
      `full_name.ilike.%${searchParams.search}%,phone_number.ilike.%${searchParams.search}%`
    )
  }

  if (searchParams.meal_type) {
    query = query.eq('meal_type', searchParams.meal_type)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  query = query.range(start, end)

  const { data: entries, count, error } = await query

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Entries</h1>
          <p className="text-gray-500 text-sm mt-1">
            {count !== null ? `${count} total record${count !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <Link
          href="/entries/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Entry
        </Link>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        defaultSearch={searchParams.search}
        defaultMealType={searchParams.meal_type}
        defaultStatus={searchParams.status}
      />

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load entries: {error.message}
        </div>
      )}

      {/* Table */}
      <EntryTable entries={entries ?? []} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{
                  pathname: '/entries',
                  query: {
                    ...searchParams,
                    page: page - 1,
                  },
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  pathname: '/entries',
                  query: {
                    ...searchParams,
                    page: page + 1,
                  },
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
