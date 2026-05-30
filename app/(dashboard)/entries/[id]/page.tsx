import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ToggleStatusButton from '@/components/entries/ToggleStatusButton'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function EntryDetailPage({
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

  const fields = [
    {
      label: 'WhatsApp Available',
      value: entry.whatsup_available ? 'Yes' : 'No',
    },
    { label: 'Full Name', value: entry.full_name },
    { label: 'Phone Number', value: entry.phone_number },
    { label: 'Alternate Phone', value: entry.alternate_phone },
    { label: 'Email', value: entry.email },
    { label: 'Street Address', value: entry.street_address },
    { label: 'Building Name', value: entry.building_name },
    { label: 'Flat No', value: entry.flat_no },
    { label: 'Landmark', value: entry.landmark },
    { label: 'Gender', value: entry.gender },
    { label: 'Meal Type', value: entry.meal_type },
    { label: 'Mess Plan Type', value: entry.mess_plan_type },
    { label: 'Meal Starting Date', value: entry.meal_starting_date },
    { label: 'Number of Persons', value: entry.number_of_persons.toString() },
    { label: 'Status', value: entry.status },
    {
      label: 'Created At',
      value: new Date(entry.created_at).toLocaleString(),
    },
    {
      label: 'Last Updated',
      value: new Date(entry.updated_at).toLocaleString(),
    },
  ]

  return (
    <div className="max-w-3xl mx-auto warm-page-block">
      {/* Header */}
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
        <div className="flex-1 min-w-0">
          <h1 className="warm-page-title truncate">
            {entry.full_name}
          </h1>
          <p className="warm-page-subtitle">{entry.phone_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`warm-chip ${
              entry.status === 'Active'
                ? 'warm-chip-active'
                : 'warm-chip-inactive'
            }`}
          >
            {entry.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/entries/${entry.id}/edit`}
          className="warm-outline-btn"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit Entry
        </Link>
        <ToggleStatusButton
          id={entry.id}
          currentStatus={entry.status as 'Active' | 'Inactive'}
        />
      </div>

      {/* Details Card */}
      <div className="warm-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ead9c4]">
          <h2 className="font-semibold text-[#3f342d]">Entry Details</h2>
        </div>
        <dl className="divide-y divide-[#efe2d0]">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="grid grid-cols-3 gap-4 px-6 py-3.5"
            >
              <dt className="text-sm font-medium text-[#7c6d62]">{label}</dt>
              <dd className="col-span-2 text-sm text-[#3f342d]">
                {value ?? (
                  <span className="text-[#b8a79a] italic">Not provided</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {entry.special_notes && (
          <div className="px-6 py-4 border-t border-[#ead9c4] bg-[#f8eee0]">
            <p className="text-xs font-medium text-[#7c6d62] mb-1">
              Special Notes
            </p>
            <p className="text-sm text-[#55493f] whitespace-pre-wrap">
              {entry.special_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
