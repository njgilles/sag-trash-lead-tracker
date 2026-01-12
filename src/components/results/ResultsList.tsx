'use client'

import { Lead } from '@/types/lead'
import { LeadCard } from './LeadCard'

interface ResultsListProps {
  leads: Lead[]
  selectedLeads: Set<string>
  onToggleLead: (leadId: string) => void
  onViewDetails?: (lead: Lead) => void
  onMarkContacted?: (lead: Lead) => void
}

export function ResultsList({
  leads,
  selectedLeads,
  onToggleLead,
  onViewDetails,
  onMarkContacted,
}: ResultsListProps) {
  return (
    <div className="space-y-2 p-4">
      {leads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          isSelected={selectedLeads.has(lead.id)}
          onToggle={onToggleLead}
          onViewDetails={onViewDetails}
          onMarkContacted={onMarkContacted}
        />
      ))}
    </div>
  )
}
