'use client'

import { AuthProvider as AuthContextProvider } from '@/context/AuthContext'
import { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>
}
