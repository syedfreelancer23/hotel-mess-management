import { withAuth } from 'next-auth/middleware'

const authDebugEnabled = process.env.AUTH_DEBUG === 'true'

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
