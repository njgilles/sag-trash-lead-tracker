'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useContactedLeads } from '@/hooks/useContactedLeads'
import { useLeadData } from '@/hooks/useLeadData'
import { Lead, LeadType } from '@/types/lead'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ContactsFilters } from '@/components/contacts/ContactsFilters'
import { EmailModal } from '@/components/email/EmailModal'
import { TemplateManagerDrawer } from '@/components/email/TemplateManagerDrawer'
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal'
import { ManualLeadModal } from '@/components/leads/ManualLeadModal'

export default function ContactsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { leads, loading: leadsLoading, error, refetch } = useContactedLeads()
  const { markAsContacted, updateContactInfo, deleteLead } = useLeadData(leads)

  const [filters, setFilters] = useState<{
    type: LeadType | 'all'
    sortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc'
    searchQuery: string
  }>({
    type: 'all',
    sortBy: 'newest',
    searchQuery: '',
  })

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null)
  const [manualLeadModalOpen, setManualLeadModalOpen] = useState(false)
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleFilterChange = (
    newFilters: Partial<typeof filters>
  ) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleSendEmail = (lead: Lead) => {
    setSelectedLead(lead)
    setEmailModalOpen(true)
  }

  const handleViewDetails = (lead: Lead) => {
    setSelectedLeadForDetails(lead)
    setDetailsModalOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsModalOpen(false)
    setSelectedLeadForDetails(null)
  }

  const handleMarkContacted = async (notes?: string) => {
    if (selectedLeadForDetails) {
      await markAsContacted(selectedLeadForDetails, notes)
    }
  }

  const handleDeleteLead = async () => {
    if (selectedLeadForDetails) {
      if (confirm(`Delete "${selectedLeadForDetails.name}"? This cannot be undone.`)) {
        try {
          await deleteLead(selectedLeadForDetails.id)
          handleCloseDetails()
          // Refetch the leads list to ensure database is in sync
          await refetch()
        } catch (err) {
          console.error('Error deleting lead:', err)
        }
      }
    }
  }

  const handleManualLeadCreated = async (newLead: Lead) => {
    // Automatically mark manual lead as contacted when created
    await markAsContacted(newLead)
    // Refetch to show the newly created lead in the list
    await refetch()
    // Show the newly created lead in details modal
    setSelectedLeadForDetails(newLead)
    setDetailsModalOpen(true)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="spinner h-10 w-10 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacted Leads</h1>
            <p className="text-gray-600 text-sm mt-1">
              {leadsLoading
                ? 'Loading...'
                : `${leads.length} lead${leads.length !== 1 ? 's' : ''} contacted`}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => setTemplateDrawerOpen(true)}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition text-sm"
            >
              Manage Templates
            </button>
            <button
              onClick={() => setManualLeadModalOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition text-sm flex items-center gap-2"
            >
              <span>+</span>
              <span>Add Manual Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {!leadsLoading && leads.length > 0 && (
        <ContactsFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      {/* Error State */}
      {error && (
        <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {leadsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="spinner h-10 w-10 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading contacted leads...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Contacted Leads Yet
              </h3>
              <p className="text-gray-600 text-sm">
                Start by searching for leads on the Map screen and marking them
                as contacted.
              </p>
            </div>
          </div>
        ) : (
          <ContactsTable
            leads={leads}
            filters={filters}
            onSendEmail={handleSendEmail}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Email Modal */}
      <EmailModal
        lead={selectedLead}
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false)
          setSelectedLead(null)
        }}
      />

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLeadForDetails}
        isOpen={detailsModalOpen}
        onClose={handleCloseDetails}
        onMarkContacted={handleMarkContacted}
        onUpdateContactInfo={updateContactInfo}
        onDelete={handleDeleteLead}
        loading={false}
      />

      {/* Manual Lead Modal */}
      <ManualLeadModal
        isOpen={manualLeadModalOpen}
        onClose={() => setManualLeadModalOpen(false)}
        onLeadCreated={handleManualLeadCreated}
        searchCenter={undefined}
      />

      {/* Template Manager Drawer */}
      <TemplateManagerDrawer
        isOpen={templateDrawerOpen}
        onClose={() => setTemplateDrawerOpen(false)}
      />
    </div>
  )
}
