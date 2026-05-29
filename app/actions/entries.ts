'use server'

import { createClient } from '@/lib/supabase/server'
import { entrySchema } from '@/lib/validations/entry'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { ActionResult } from '@/types'

function mapDbError(message: string): string {
  if (message.includes('invalid input syntax for type uuid')) {
    return 'Database schema mismatch detected. hotel_mess_entries.created_by is still UUID in your live database, but the app now writes integer users.user_id values. Update that column to integer and point the foreign key to public.users(user_id), or rerun the corrected schema in supabase/schema.sql.'
  }

  return message
}

export async function createEntry(formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: 'You must be logged in to create an entry' }
  }

  if (session.user.role !== 2) {
    return { error: 'Only role_id 2 users can submit new entries.' }
  }

  const userId = parseInt(session.user.id, 10)
  if (Number.isNaN(userId)) {
    return { error: 'Invalid session user id. Please sign out and sign in again.' }
  }

  const rawData = {
    whatsup_available: formData.get('whatsup_available') || false,
    full_name: formData.get('full_name'),
    phone_number: formData.get('phone_number'),
    alternate_phone: formData.get('alternate_phone'),
    email: formData.get('email'),
    street_address: formData.get('street_address'),
    building_name: formData.get('building_name'),
    flat_no: formData.get('flat_no'),
    landmark: formData.get('landmark'),
    gender: formData.get('gender'),
    meal_type: formData.get('meal_type'),
    mess_plan_type: formData.get('mess_plan_type'),
    number_of_persons: formData.get('number_of_persons'),
    special_notes: formData.get('special_notes'),
    meal_starting_date: formData.get('meal_starting_date'),
    status: formData.get('status') || 'Active',
  }

  const result = entrySchema.safeParse(rawData)

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(', ')
    return { error: errors }
  }

  const data = result.data
  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('hotel_mess_entries')
    .insert({
      ...data,
      alternate_phone: data.alternate_phone || null,
      email: data.email || null,
      flat_no: data.flat_no || null,
      landmark: data.landmark || null,
      gender: data.gender || null,
      special_notes: data.special_notes || null,
      meal_starting_date: data.meal_starting_date || null,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error) {
    return { error: mapDbError(error.message) }
  }

  revalidatePath('/entries')
  revalidatePath('/dashboard')
  return { success: true, id: entry.id }
}

export async function updateEntry(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: 'You must be logged in to update an entry' }
  }

  const userId = parseInt(session.user.id, 10)
  if (Number.isNaN(userId)) {
    return { error: 'Invalid session user id. Please sign out and sign in again.' }
  }

  const rawData = {
    whatsup_available: formData.get('whatsup_available') || false,
    full_name: formData.get('full_name'),
    phone_number: formData.get('phone_number'),
    alternate_phone: formData.get('alternate_phone'),
    email: formData.get('email'),
    street_address: formData.get('street_address'),
    building_name: formData.get('building_name'),
    flat_no: formData.get('flat_no'),
    landmark: formData.get('landmark'),
    gender: formData.get('gender'),
    meal_type: formData.get('meal_type'),
    mess_plan_type: formData.get('mess_plan_type'),
    number_of_persons: formData.get('number_of_persons'),
    special_notes: formData.get('special_notes'),
    meal_starting_date: formData.get('meal_starting_date'),
    status: formData.get('status') || 'Active',
  }

  const result = entrySchema.safeParse(rawData)

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(', ')
    return { error: errors }
  }

  const data = result.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('hotel_mess_entries')
    .update({
      ...data,
      alternate_phone: data.alternate_phone || null,
      email: data.email || null,
      flat_no: data.flat_no || null,
      landmark: data.landmark || null,
      gender: data.gender || null,
      special_notes: data.special_notes || null,
      meal_starting_date: data.meal_starting_date || null,
    })
    .eq('id', id)
    .eq('created_by', userId)

  if (error) {
    return { error: mapDbError(error.message) }
  }

  revalidatePath('/entries')
  revalidatePath(`/entries/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleEntryStatus(
  id: string,
  newStatus: 'Active' | 'Inactive'
): Promise<ActionResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: 'You must be logged in' }
  }

  const userId = parseInt(session.user.id, 10)
  if (Number.isNaN(userId)) {
    return { error: 'Invalid session user id. Please sign out and sign in again.' }
  }
  const supabase = await createClient()

  const { error } = await supabase
    .from('hotel_mess_entries')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('created_by', userId)

  if (error) {
    return { error: mapDbError(error.message) }
  }

  revalidatePath('/entries')
  revalidatePath(`/entries/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}
