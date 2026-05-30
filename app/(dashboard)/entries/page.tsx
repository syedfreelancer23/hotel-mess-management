import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import SearchFilterBar from '@/components/entries/SearchFilterBar'
import EntryTable from '@/components/entries/EntryTable'
import { authOptions } from '@/lib/auth'

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
  const session = await getServerSession(authOptions)

  if (session?.user?.role === 2) {
    redirect('/entries/new')
  }

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
    <div className="warm-page-block">
      {/* Page Header */}
      <div className="warm-page-header sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="warm-page-title">All Entries</h1>
          <p className="warm-page-subtitle">
            {count !== null ? `${count} total record${count !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <Link
          href="/entries/new"
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
        <div className="warm-alert">
          Failed to load entries: {error.message}
        </div>
      )}

      {/* Table */}
      <EntryTable entries={entries ?? []} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-[#7d6e63]">
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
                className="warm-outline-btn"
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
                className="warm-outline-btn"
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
