import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    name: string
    role?: number
  }

  interface Session {
    user: {
      id: string
      name: string
      role?: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: number
  }
}
