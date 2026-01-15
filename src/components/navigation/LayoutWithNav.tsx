'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { TabNav } from './TabNav'

export function LayoutWithNav({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="flex flex-col h-screen">
      {user && <TabNav user={user} />}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
