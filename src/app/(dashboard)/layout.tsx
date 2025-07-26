import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
