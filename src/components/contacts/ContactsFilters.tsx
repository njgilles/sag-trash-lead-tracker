'use client'

import { LeadType } from '@/types/lead'

interface ContactsFiltersProps {
  filters: {
    type: LeadType | 'all'
    sortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc'
    searchQuery: string
  }
  onFilterChange: (filters: {
    type?: LeadType | 'all'
    sortBy?: 'newest' | 'oldest' | 'name-asc' | 'name-desc'
    searchQuery?: string
  }) => void
}

export function ContactsFilters({
  filters,
  onFilterChange,
}: ContactsFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex flex-wrap gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-64">
        <input
          type="text"
          placeholder="Search by name or address..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
      </div>

      {/* Type Filter */}
      <div className="flex-shrink-0">
        <select
          value={filters.type}
          onChange={(e) =>
            onFilterChange({
              type: e.target.value as LeadType | 'all',
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
        >
          <option value="all">All Types</option>
          <option value="pool">Swimming Pools</option>
          <option value="hoa">HOAs</option>
          <option value="neighborhood">Neighborhoods</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="flex-shrink-0">
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFilterChange({
              sortBy: e.target.value as
                | 'newest'
                | 'oldest'
                | 'name-asc'
                | 'name-desc',
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>
    </div>
  )
}
