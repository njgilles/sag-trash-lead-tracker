'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/context/AuthContext'

interface TabNavProps {
  user: User | null
}

export function TabNav({ user }: TabNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <nav className="bg-dark-600 border-b border-dark-400 shadow-sm flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Logo and Tabs */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/shark-logo.jpg"
              alt="SAG-Trash Shark Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {/* Map Tab */}
            <Link
              href="/map"
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                isActive('/map')
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-dark-50 hover:text-white'
              }`}
            >
              Map
            </Link>

            {/* Contracts Tab */}
            <Link
              href="/contracts"
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                isActive('/contracts')
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-dark-50 hover:text-white'
              }`}
            >
              Contracts
            </Link>

            {/* Contacts Tab */}
            <Link
              href="/contacts"
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                isActive('/contacts')
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-dark-50 hover:text-white'
              }`}
            >
              Contacts
            </Link>
          </div>
        </div>

        {/* Right: User Info and Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-dark-50">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white hover:bg-dark-500 border border-dark-400 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
