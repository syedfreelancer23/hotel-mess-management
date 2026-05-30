import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StatsCard from '@/components/dashboard/StatsCard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalResult, todayResult, activeResult] = await Promise.all([
    supabase
      .from('hotel_mess_entries')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('hotel_mess_entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase
      .from('hotel_mess_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active'),
  ])

  return {
    total: totalResult.count ?? 0,
    today: todayResult.count ?? 0,
    active: activeResult.count ?? 0,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const canCreate = session?.user?.role === 2

  if (canCreate) {
    return (
      <div className="warm-page-block">
        <div className="warm-page-header sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="warm-page-title">Dashboard</h1>
            <p className="warm-page-subtitle">
              You can create a new guest mess entry from here.
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
      </div>
    )
  }

  const supabase = await createClient()

  const [stats, { data: recentEntries }] = await Promise.all([
    getDashboardStats(),
    supabase
      .from('hotel_mess_entries')
      .select('id, full_name, phone_number, meal_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
      <div className="warm-page-block">
      {/* Page Header */}
      <div className="warm-page-header sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="warm-page-title">Dashboard</h1>
          <p className="warm-page-subtitle">
            Welcome back! Here&apos;s an overview of your mess management.
          </p>
        </div>
        {canCreate && (
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
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Entries"
          value={stats.total}
          icon="users"
          color="blue"
          href="/entries"
        />
        <StatsCard
          title="Today&apos;s Entries"
          value={stats.today}
          icon="calendar"
          color="green"
          href="/entries"
        />
        <StatsCard
          title="Active Plans"
          value={stats.active}
          icon="check-circle"
          color="purple"
          href="/entries?status=Active"
        />
      </div>

      {/* Recent Entries */}
      <div className="warm-surface overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ead9c4]">
          <h2 className="font-semibold text-[#3f342d]">Recent Entries</h2>
          <Link
            href="/entries"
            className="warm-link text-sm"
          >
            View all →
          </Link>
        </div>

        {!recentEntries || recentEntries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <svg
              className="mx-auto w-12 h-12 text-[#c7b7a8] mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-[#8c7a6f] text-sm">No entries yet.</p>
            {canCreate && (
              <Link
                href="/entries/new"
                className="mt-2 inline-block text-sm warm-link"
              >
                Create your first entry
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#efe2d0]">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#fff6ea] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#f4dfc8] flex items-center justify-center text-[#8d4f31] font-semibold text-sm">
                    {entry.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#3f342d] text-sm truncate">
                      {entry.full_name}
                    </p>
                    <p className="text-[#8c7a6f] text-xs">{entry.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline warm-chip warm-chip-neutral">
                    {entry.meal_type}
                  </span>
                  <span
                    className={`warm-chip ${
                      entry.status === 'Active'
                        ? 'warm-chip-active'
                        : 'warm-chip-inactive'
                    }`}
                  >
                    {entry.status}
                  </span>
                  <Link
                    href={`/entries/${entry.id}`}
                    className="text-xs warm-link"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
