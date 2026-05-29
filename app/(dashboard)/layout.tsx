import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const displayName = session.user?.name || 'User'
  const userRole = session.user?.role

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">
        <Header userName={displayName} userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
