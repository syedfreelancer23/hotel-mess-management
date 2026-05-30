import Link from 'next/link'
import EntryForm from '@/components/entries/EntryForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function NewEntryPage() {
  const session = await getServerSession(authOptions)
  const canCreate = session?.user?.role === 2

  return (
    <div className="max-w-3xl mx-auto warm-page-block">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/entries"
          className="warm-outline-btn !w-9 !h-9 !min-h-0 !p-0"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="warm-page-title">New Guest Entry</h1>
          <p className="warm-page-subtitle">
            Fill in the details to register a new guest mess entry.
          </p>
        </div>
      </div>

      <EntryForm mode="create" canCreate={canCreate} />
    </div>
  )
}
