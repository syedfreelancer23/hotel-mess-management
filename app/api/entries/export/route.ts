import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import * as XLSX from 'xlsx'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 1) {
    return NextResponse.json(
      { error: 'Only admin users can export entries.' },
      { status: 403 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hotel_mess_entries')
    .select(
      'id, whatsup_available, full_name, phone_number, alternate_phone, email, street_address, building_name, flat_no, landmark, gender, meal_type, mess_plan_type, number_of_persons, meal_starting_date, status, special_notes, created_by, created_at, updated_at'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []).map((entry) => ({
    ID: entry.id,
    WhatsAppAvailable: entry.whatsup_available ? 'Yes' : 'No',
    Name: entry.full_name,
    Phone: entry.phone_number,
    AlternatePhone: entry.alternate_phone ?? '',
    Email: entry.email ?? '',
    StreetAddress: entry.street_address ?? '',
    BuildingName: entry.building_name ?? '',
    FlatNo: entry.flat_no ?? '',
    Landmark: entry.landmark ?? '',
    Gender: entry.gender ?? '',
    MealType: entry.meal_type,
    MessPlanType: entry.mess_plan_type,
    NumberOfPersons: entry.number_of_persons,
    MealStartingDate: entry.meal_starting_date ?? '',
    Status: entry.status,
    SpecialNotes: entry.special_notes ?? '',
    CreatedByUserId: entry.created_by,
    CreatedAt: new Date(entry.created_at).toISOString(),
    UpdatedAt: new Date(entry.updated_at).toISOString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries')

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  })

  const fileName = `hotel-mess-entries-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}
