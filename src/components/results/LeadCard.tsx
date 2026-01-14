'use client'

import { Lead } from '@/types/lead'

interface LeadCardProps {
  lead: Lead
  isSelected: boolean
  onToggle: (leadId: string) => void
  onViewDetails?: (lead: Lead) => void
  onMarkContacted?: (lead: Lead) => void
}

const TYPE_BADGES = {
  pool: { bg: 'bg-red-100', text: 'text-red-700', icon: '🏊' },
  hoa: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🏘️' },
  neighborhood: { bg: 'bg-green-100', text: 'text-green-700', icon: '📍' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📌' },
}

export function LeadCard({
  lead,
  isSelected,
  onToggle,
  onViewDetails,
  onMarkContacted,
}: LeadCardProps) {
  const badge = TYPE_BADGES[lead.type]
  const isContacted = lead.contacted
  const isNotInterested = lead.notInterested

  return (
    <div
      className={`lead-card ${isSelected ? 'selected' : ''} ${
        isContacted || isNotInterested ? 'opacity-60' : ''
      } transition-all`}
    >
      <div className="flex gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(lead.id)}
          className="w-4 h-4 accent-cyan-500 mt-1 flex-shrink-0 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-sm truncate ${
                  isContacted
                    ? 'line-through text-gray-500'
                    : 'text-gray-900'
                }`}
              >
                {lead.name}
              </h3>
              <p className="text-xs text-gray-600 truncate mb-1">
                {lead.address}
              </p>
            </div>
            {isContacted && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                  ✓
                </div>
                <span className="text-xs font-semibold text-green-700 whitespace-nowrap">
                  Contacted
                </span>
              </div>
            )}
            {isNotInterested && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                  ✕
                </div>
                <span className="text-xs font-semibold text-red-700 whitespace-nowrap">
                  Not Interested
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
            >
              {badge.icon} {lead.type}
            </span>

            {lead.distance && (
              <span className="text-xs text-gray-600">📍 {lead.distance} mi</span>
            )}

            {lead.rating && (
              <span className="text-xs text-gray-600">
                ⭐ {lead.rating.toFixed(1)}
              </span>
            )}
          </div>

          {lead.contactPerson && (
            <p className="text-xs text-gray-700 mb-1">
              👤 {lead.contactPerson}
            </p>
          )}

          {lead.phone && (
            <p className="text-xs text-gray-600 mb-1">
              📞{' '}
              <a
                href={`tel:${lead.phone}`}
                className="text-cyan-600 hover:text-cyan-700"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.phone}
              </a>
            </p>
          )}

          {lead.email && (
            <p className="text-xs mb-1">
              📧{' '}
              <a
                href={`mailto:${lead.email}`}
                className="text-cyan-600 hover:text-cyan-700 break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.email}
              </a>
            </p>
          )}

          {lead.website && (
            <p className="text-xs mb-2">
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700"
                onClick={(e) => e.stopPropagation()}
              >
                Visit website →
              </a>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            {onViewDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(lead)
                }}
                className="flex-1 text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 transition font-medium"
              >
                View Details
              </button>
            )}

            {!isContacted && !isNotInterested && onMarkContacted && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkContacted(lead)
                }}
                className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
              >
                Mark Contacted
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
