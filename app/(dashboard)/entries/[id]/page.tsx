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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/entries"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
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
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {entry.full_name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{entry.phone_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              entry.status === 'Active'
                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                : 'bg-gray-100 text-gray-500 ring-1 ring-gray-400/20'
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
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Entry Details</h2>
        </div>
        <dl className="divide-y divide-gray-50">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="grid grid-cols-3 gap-4 px-6 py-3.5"
            >
              <dt className="text-sm font-medium text-gray-500">{label}</dt>
              <dd className="col-span-2 text-sm text-gray-900">
                {value ?? (
                  <span className="text-gray-300 italic">Not provided</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {entry.special_notes && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Special Notes
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {entry.special_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
