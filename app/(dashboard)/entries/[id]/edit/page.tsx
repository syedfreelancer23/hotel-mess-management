import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EntryForm from '@/components/entries/EntryForm'
import type { HotelMessEntry } from '@/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function EditEntryPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === 2) {
    redirect('/entries/new')
  }

  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('hotel_mess_entries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !entry) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto warm-page-block">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/entries/${params.id}`}
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
          <h1 className="warm-page-title">Edit Entry</h1>
          <p className="warm-page-subtitle">
            Update the details for{' '}
            <span className="font-medium text-[#6a5548]">{entry.full_name}</span>
          </p>
        </div>
      </div>

      <EntryForm
        mode="edit"
        entryId={params.id}
        initialData={entry as HotelMessEntry}
      />
    </div>
  )
}
