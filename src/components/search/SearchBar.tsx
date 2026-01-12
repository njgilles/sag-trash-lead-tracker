'use client'

import { useState, useCallback } from 'react'
import { LeadType, Location } from '@/types/lead'

interface SearchBarProps {
  onSearch: (location: Location | string, radius: number, types: LeadType[]) => void
  loading?: boolean
  defaultRadius?: number
}

export function SearchBar({ onSearch, loading, defaultRadius = 5000 }: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchInput.trim()) {
        onSearch(searchInput, defaultRadius, ['pool', 'hoa', 'neighborhood'])
      }
    },
    [searchInput, onSearch, defaultRadius]
  )

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Enter address or zip code..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !searchInput.trim()}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
