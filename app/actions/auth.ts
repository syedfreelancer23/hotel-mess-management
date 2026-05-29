'use server'

import { redirect } from 'next/navigation'

/**
 * Server action called by the Header logout button.
 * NextAuth sign-out is handled client-side in the Header component;
 * this action is kept as a fallback redirect for non-JS environments.
 */
export async function signOut() {
  redirect('/api/auth/signout')
}
