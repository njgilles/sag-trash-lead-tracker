'use client'

import { Lead, LeadType } from '@/types/lead'

interface ContactsTableProps {
  leads: Lead[]
  filters: {
    type: LeadType | 'all'
    sortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc'
    searchQuery: string
  }
  onSendEmail?: (lead: Lead) => void
  onViewDetails?: (lead: Lead) => void
}

const typeColors: Record<LeadType, { bg: string; text: string; badge: string }> = {
  pool: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  hoa: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  neighborhood: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100',
  },
  other: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    badge: 'bg-purple-100',
  },
}

export function ContactsTable({
  leads,
  filters,
  onSendEmail,
  onViewDetails,
}: ContactsTableProps) {
  // Filter leads
  let filteredLeads = leads.filter((lead) => {
    // Filter by type
    if (filters.type !== 'all' && lead.type !== filters.type) {
      return false
    }

    // Filter by search query (name or address)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.address.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Sort leads
  filteredLeads.sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return (
          new Date(b.contactedDate || 0).getTime() -
          new Date(a.contactedDate || 0).getTime()
        )
      case 'oldest':
        return (
          new Date(a.contactedDate || 0).getTime() -
          new Date(b.contactedDate || 0).getTime()
        )
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  if (filteredLeads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No contacted leads found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-y border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Type
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Contacted Date
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Contact Person
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Email
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Phone
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Notes
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead, idx) => (
            <tr
              key={lead.id}
              className={`border-b border-gray-200 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-gray-100 transition`}
            >
              {/* Name */}
              <td className="px-6 py-3">
                <button
                  onClick={() => onViewDetails?.(lead)}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  {lead.name}
                </button>
              </td>

              {/* Type Badge */}
              <td className="px-6 py-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    typeColors[lead.type].badge
                  } ${typeColors[lead.type].text}`}
                >
                  {lead.type.charAt(0).toUpperCase() + lead.type.slice(1)}
                </span>
              </td>

              {/* Contact Date */}
              <td className="px-6 py-3 text-gray-600">
                {lead.contactedDate
                  ? new Date(lead.contactedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'}
              </td>

              {/* Contact Person */}
              <td className="px-6 py-3 text-gray-600">
                {lead.contactPerson || '-'}
              </td>

              {/* Email */}
              <td className="px-6 py-3">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-cyan-600 hover:text-cyan-700 underline"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              {/* Phone */}
              <td className="px-6 py-3">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-cyan-600 hover:text-cyan-700 underline"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              {/* Notes */}
              <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                {lead.contactNotes || '-'}
              </td>

              {/* Actions */}
              <td className="px-6 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onSendEmail?.(lead)}
                    className="px-3 py-1 text-xs font-medium text-cyan-600 hover:bg-cyan-50 rounded transition"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => onViewDetails?.(lead)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded transition"
                  >
                    Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
