import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { LayoutWithNav } from '@/components/navigation/LayoutWithNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAG-Trash Client Finder',
  description: 'Lead generation tool for finding pools, HOAs, and neighborhoods',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overflow-hidden">
        <AuthProvider>
          <LayoutWithNav>{children}</LayoutWithNav>
        </AuthProvider>
      </body>
    </html>
  )
}
