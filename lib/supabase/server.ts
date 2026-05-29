import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Anonymous Supabase client for server-side data queries.
 * RLS is disabled on hotel_mess_entries; authorization is enforced
 * at the application layer via NextAuth session checks in server actions.
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
