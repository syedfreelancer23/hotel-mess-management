'use server'

import { createClient } from '@/lib/supabase/server'
import { entrySchema } from '@/lib/validations/entry'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

export async function createEntry(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create an entry' }
  }

  const rawData = {
    full_name: formData.get('full_name'),
    phone_number: formData.get('phone_number'),
    alternate_phone: formData.get('alternate_phone'),
    email: formData.get('email'),
    gender: formData.get('gender'),
    nationality: formData.get('nationality'),
    emirates_id_or_passport: formData.get('emirates_id_or_passport'),
    meal_type: formData.get('meal_type'),
    mess_plan_type: formData.get('mess_plan_type'),
    number_of_persons: formData.get('number_of_persons'),
    special_notes: formData.get('special_notes'),
    status: formData.get('status') || 'Active',
  }

  const result = entrySchema.safeParse(rawData)

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(', ')
    return { error: errors }
  }

  const data = result.data

  const { data: entry, error } = await supabase
    .from('hotel_mess_entries')
    .insert({
      ...data,
      alternate_phone: data.alternate_phone || null,
      email: data.email || null,
      gender: data.gender || null,
      nationality: data.nationality || null,
      emirates_id_or_passport: data.emirates_id_or_passport || null,
      special_notes: data.special_notes || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/entries')
  revalidatePath('/dashboard')
  return { success: true, id: entry.id }
}

export async function updateEntry(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update an entry' }
  }

  const rawData = {
    full_name: formData.get('full_name'),
    phone_number: formData.get('phone_number'),
    alternate_phone: formData.get('alternate_phone'),
    email: formData.get('email'),
    gender: formData.get('gender'),
    nationality: formData.get('nationality'),
    emirates_id_or_passport: formData.get('emirates_id_or_passport'),
    meal_type: formData.get('meal_type'),
    mess_plan_type: formData.get('mess_plan_type'),
    number_of_persons: formData.get('number_of_persons'),
    special_notes: formData.get('special_notes'),
    status: formData.get('status') || 'Active',
  }

  const result = entrySchema.safeParse(rawData)

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(', ')
    return { error: errors }
  }

  const data = result.data

  const { error } = await supabase
    .from('hotel_mess_entries')
    .update({
      ...data,
      alternate_phone: data.alternate_phone || null,
      email: data.email || null,
      gender: data.gender || null,
      nationality: data.nationality || null,
      emirates_id_or_passport: data.emirates_id_or_passport || null,
      special_notes: data.special_notes || null,
    })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    return { error: error.message }
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { error } = await supabase
    .from('hotel_mess_entries')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/entries')
  revalidatePath(`/entries/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}
