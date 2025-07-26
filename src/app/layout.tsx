import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'SponsorFlow - YouTube Sponsorship Management',
    template: '%s | SponsorFlow',
  },
  description: 'Transform your YouTube sponsorship chaos into organized success with our intuitive Kanban board workflow management system.',
  keywords: ['YouTube', 'sponsorship', 'management', 'creator tools', 'workflow', 'kanban'],
  authors: [{ name: 'SponsorFlow Team' }],
  creator: 'SponsorFlow',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SponsorFlow - YouTube Sponsorship Management',
    description: 'Transform your YouTube sponsorship chaos into organized success',
    siteName: 'SponsorFlow',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SponsorFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SponsorFlow - YouTube Sponsorship Management',
    description: 'Transform your YouTube sponsorship chaos into organized success',
    images: ['/twitter-image.png'],
    creator: '@sponsorflow',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
