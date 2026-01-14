'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFilters } from '@/components/search/SearchFilters'
import { GoogleMap } from '@/components/map/GoogleMap'
import { ResultsList } from '@/components/results/ResultsList'
import { ExportButton } from '@/components/export/ExportButton'
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal'
import { useLeadSearch } from '@/hooks/useLeadSearch'
import { useLeadData } from '@/hooks/useLeadData'
import { Lead, LeadType, Location } from '@/types/lead'
import { saveSearchState, loadSearchState, clearSearchState } from '@/lib/search-cache'

export default function MapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const { leads, searchCenter, loading: searchLoading, error, search } = useLeadSearch()
  const {
    enhancedLeads,
    markAsContacted,
    markAsNotInterested,
    updateContactInfo,
    deleteLead,
  } = useLeadData(leads)

  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<{
    types: LeadType[]
    radius: number
  }>({
    types: ['pool', 'hoa', 'neighborhood'],
    radius: 5000, // 5km default
  })

  // Modal state for lead details
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // State to show when data was restored from cache
  const [restoredFromCache, setRestoredFromCache] = useState(false)

  // Load cached state on mount
  useEffect(() => {
    const cached = loadSearchState()
    if (cached && cached.leads.length > 0) {
      setFilters({
        types: cached.filters.types,
        radius: cached.filters.radius,
      })
      setSelectedLeads(new Set(cached.selectedLeads))
      setRestoredFromCache(true)

      // Auto-hide restored indicator after 3 seconds
      const timer = setTimeout(() => setRestoredFromCache(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSearch = useCallback(
    async (location: Location | string, radius: number, types: LeadType[]) => {
      // Clear old cache before new search
      clearSearchState()
      setSelectedLeads(new Set())
      await search({ location, radius, types })
    },
    [search]
  )

  // Save filters when they change
  useEffect(() => {
    const cached = loadSearchState()
    if (cached && leads.length > 0) {
      saveSearchState({
        ...cached,
        filters,
      })
    }
  }, [filters, leads])

  // Save selected leads when they change
  useEffect(() => {
    const cached = loadSearchState()
    if (cached && leads.length > 0) {
      saveSearchState({
        ...cached,
        selectedLeads: Array.from(selectedLeads),
      })
    }
  }, [selectedLeads, leads])

  const toggleLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const toggleAllLeads = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)))
    }
  }

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead)
    setModalOpen(true)
  }

  const handleMarkContacted = async (lead: Lead) => {
    await markAsContacted(lead.id)
  }

  const handleMarkNotInterested = async (reason?: string) => {
    if (selectedLead) {
      await markAsNotInterested(selectedLead.id, reason)
    }
  }

  const handleDeleteLead = async () => {
    if (selectedLead) {
      if (confirm(`Delete "${selectedLead.name}"? This cannot be undone.`)) {
        try {
          await deleteLead(selectedLead.id)
          setModalOpen(false)
          setSelectedLead(null)
        } catch (err) {
          console.error('Error deleting lead:', err)
        }
      }
    }
  }

  const handleNewSearch = () => {
    clearSearchState()
    setSelectedLeads(new Set())
    setFilters({
      types: ['pool', 'hoa', 'neighborhood'],
      radius: 5000,
    })
  }

  const selectedLeadsData = leads.filter(lead => selectedLeads.has(lead.id))

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-96 flex flex-col bg-white shadow-lg border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-4 flex-shrink-0">
          <h1 className="text-xl font-bold">SAG-Trash Client Finder</h1>
          <p className="text-xs opacity-90">Lead generation for pool service</p>
        </div>

        {/* Search Section */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <SearchBar
            onSearch={handleSearch}
            loading={searchLoading}
            defaultRadius={filters.radius}
          />
        </div>

        {/* Filters Section */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <SearchFilters
            selectedTypes={filters.types}
            radius={filters.radius}
            onTypesChange={(types) => setFilters({ ...filters, types })}
            onRadiusChange={(radius) => setFilters({ ...filters, radius })}
          />
        </div>

        {/* Restored Cache Indicator */}
        {restoredFromCache && (
          <div className="flex-shrink-0 mx-4 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center justify-between">
            <span>
              ℹ️ Restored previous search results
            </span>
            <button
              onClick={handleNewSearch}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex-shrink-0 mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Found {leads.length} leads
            </span>
            {leads.length > 0 && (
              <button
                onClick={toggleAllLeads}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                {selectedLeads.size === leads.length
                  ? 'Deselect all'
                  : 'Select all'}
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto">
          {searchLoading && leads.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="spinner h-10 w-10 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Searching for leads...</p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center px-4">
                Enter a location and click search to find leads
              </p>
            </div>
          ) : (
            <ResultsList
              leads={enhancedLeads}
              selectedLeads={selectedLeads}
              onToggleLead={toggleLead}
              onViewDetails={handleViewDetails}
              onMarkContacted={handleMarkContacted}
            />
          )}
        </div>

        {/* Export Button */}
        {leads.length > 0 && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <ExportButton leads={selectedLeadsData} />
          </div>
        )}
      </div>

      {/* Map Section */}
      <div className="flex-1">
        <GoogleMap
          leads={enhancedLeads}
          searchCenter={searchCenter}
          selectedLeads={selectedLeads}
          radius={filters.radius}
        />
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedLead(null)
        }}
        onMarkContacted={(notes?: string) => {
          if (selectedLead) {
            markAsContacted(selectedLead.id, notes)
          }
        }}
        onUpdateContactInfo={updateContactInfo}
        onDelete={handleDeleteLead}
      />
    </div>
  )
}
