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
    <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Logo and Tabs */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded p-1">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900">SAG-Trash</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {/* Map Tab */}
            <Link
              href="/map"
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                isActive('/map')
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Map
            </Link>

            {/* Contacts Tab */}
            <Link
              href="/contacts"
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                isActive('/contacts')
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
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
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
