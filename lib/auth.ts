import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/service'

// Debug logs intentionally disabled.
// Set to true temporarily only when actively troubleshooting auth in deployment logs.
const authDebugEnabled = false

function debugAuthLog(message: string, meta?: Record<string, unknown>) {
  if (!authDebugEnabled) return
  if (meta) {
    console.log(`[auth-debug] ${message}`, meta)
    return
  }
  console.log(`[auth-debug] ${message}`)
}

function maskUsername(username: string) {
  if (username.length <= 2) return `${username[0] ?? '*'}*`
  return `${username.slice(0, 2)}***`
}

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
        const attemptedUsername = credentials?.username?.trim() ?? ''
        debugAuthLog('Credentials authorize called', {
          hasUsername: Boolean(attemptedUsername),
          hasPassword: Boolean(credentials?.password),
          usernameHint: attemptedUsername ? maskUsername(attemptedUsername) : null,
        })

        if (!credentials?.username || !credentials?.password) return null

        const supabase = createServiceClient()

        const { data: user, error } = await supabase
          .from('users')
          .select('user_id, username, password_hash, role_id')
          .eq('username', credentials.username.trim())
          .single()

        if (error || !user) {
          debugAuthLog('User lookup failed', {
            hasError: Boolean(error),
            foundUser: Boolean(user),
            usernameHint: maskUsername(credentials.username.trim()),
          })
          return null
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )
        if (!passwordValid) {
          debugAuthLog('Password verification failed', {
            userId: user.user_id,
            usernameHint: maskUsername(user.username),
          })
          return null
        }

        debugAuthLog('Credentials authorize succeeded', {
          userId: user.user_id,
          role: user.role_id,
          usernameHint: maskUsername(user.username),
        })

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
        debugAuthLog('JWT updated from user payload', {
          userId: token.id,
          role: token.role,
        })
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: number }).role = token.role as number
        debugAuthLog('Session materialized from token', {
          sessionUserId: session.user.id,
          role: (session.user as { role?: number }).role,
        })
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
