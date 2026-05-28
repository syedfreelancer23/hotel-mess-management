import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatsCard from '@/components/dashboard/StatsCard'

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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [stats, { data: recentEntries }] = await Promise.all([
    getDashboardStats(),
    supabase
      .from('hotel_mess_entries')
      .select('id, full_name, phone_number, meal_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here&apos;s an overview of your mess management.
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Entries</h2>
          <Link
            href="/entries"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {!recentEntries || recentEntries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <svg
              className="mx-auto w-12 h-12 text-gray-300 mb-3"
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
            <p className="text-gray-400 text-sm">No entries yet.</p>
            <Link
              href="/entries/new"
              className="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first entry
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {entry.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {entry.full_name}
                    </p>
                    <p className="text-gray-400 text-xs">{entry.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
                    {entry.meal_type}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.status === 'Active'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {entry.status}
                  </span>
                  <Link
                    href={`/entries/${entry.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
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
