import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/auth'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  // Redirect to dashboard if already authenticated
  if (session) {
    redirect('/board')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
      <div className="relative w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
