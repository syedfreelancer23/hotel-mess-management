import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/service'

export const authOptions: NextAuthOptions = {
  // Explicit session timing keeps multi-device logins predictable in production.
  // Each device has its own JWT cookie and remains signed in until maxAge expires.
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const supabase = createServiceClient()

        const { data: user, error } = await supabase
          .from('users')
          .select('user_id, username, password_hash, role_id')
          .eq('username', credentials.username.trim())
          .single()

        if (error || !user) return null

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )
        if (!passwordValid) return null

        return {
          id: String(user.user_id),
          name: user.username,
          role: user.role_id,
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: number }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: number }).role = token.role as number
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },

  secret: process.env.NEXTAUTH_SECRET,
}
