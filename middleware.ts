import { withAuth } from 'next-auth/middleware'

// Debug logs intentionally disabled.
// Set to true temporarily only when actively troubleshooting auth in deployment logs.
const authDebugEnabled = false

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const isAuthorized = Boolean(token)

      if (authDebugEnabled) {
        console.log('[auth-debug] Middleware authorization check', {
          path: req.nextUrl.pathname,
          hasToken: Boolean(token),
          tokenUserId: token?.id ?? null,
          role: token?.role ?? null,
          isAuthorized,
        })
      }

      return isAuthorized
    },
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/entries/:path*',
  ],
}
