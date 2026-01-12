'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      // Redirect to /map if authenticated, /login if not
      const destination = user ? '/map' : '/login'
      router.push(destination)
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="text-center">
        <div className="spinner h-10 w-10 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
