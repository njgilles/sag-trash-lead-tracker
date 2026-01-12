import { useEffect, useState, useCallback } from 'react'
import { Lead } from '@/types/lead'
import {
  getLeadData,
  updateLeadData,
  markAsContacted as firestoreMarkAsContacted,
  markAsUncontacted as firestoreMarkAsUncontacted,
} from '@/lib/firestore-service'

interface UseLeadDataReturn {
  enhancedLeads: Lead[]
  loading: boolean
  error: string | null
  markAsContacted: (placeId: string, notes?: string) => Promise<void>
  markAsUncontacted: (placeId: string) => Promise<void>
  updateContactInfo: (
    placeId: string,
    data: {
      contactPerson?: string
      email?: string
      contactNotes?: string
    }
  ) => Promise<void>
}

/**
 * Hook for managing lead data with Firestore sync
 * Fetches metadata from Firestore and merges with search results
 */
export function useLeadData(leads: Lead[]): UseLeadDataReturn {
  const [enhancedLeads, setEnhancedLeads] = useState<Lead[]>(leads)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch Firestore data for all leads
  useEffect(() => {
    if (leads.length === 0) {
      setEnhancedLeads([])
      return
    }

    const fetchLeadMetadata = async () => {
      setLoading(true)
      setError(null)

      try {
        const enhancedLeadsData = await Promise.all(
          leads.map(async (lead) => {
            try {
              const metadata = await getLeadData(lead.id)

              // Merge Firestore metadata with lead data
              return {
                ...lead,
                ...metadata,
                // Don't override existing data with undefined values
                contactPerson: metadata?.contactPerson || lead.contactPerson,
                email: metadata?.email || lead.email,
                contacted: metadata?.contacted || lead.contacted,
                contactedDate: metadata?.contactedDate
                  ? metadata.contactedDate.toDate?.()?.toISOString() ||
                    lead.contactedDate
                  : lead.contactedDate,
                contactNotes: metadata?.contactNotes || lead.contactNotes,
              }
            } catch (err) {
              console.error(`Error fetching metadata for lead ${lead.id}:`, err)
              // Return original lead if fetch fails
              return lead
            }
          })
        )

        setEnhancedLeads(enhancedLeadsData)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch lead data'
        setError(errorMessage)
        // Fall back to original leads
        setEnhancedLeads(leads)
      } finally {
        setLoading(false)
      }
    }

    fetchLeadMetadata()
  }, [leads])

  const markAsContacted = useCallback(
    async (placeIdOrLead: string | Lead, notes?: string) => {
      try {
        // Handle both string placeId (for backward compatibility) and Lead object
        let leadToMark: Lead | undefined
        let placeId: string

        if (typeof placeIdOrLead === 'string') {
          placeId = placeIdOrLead
          // Find the lead from enhancedLeads
          leadToMark = enhancedLeads.find((l) => l.id === placeId)
        } else {
          leadToMark = placeIdOrLead
          placeId = placeIdOrLead.id
        }

        if (!leadToMark) {
          throw new Error(`Lead with id ${placeId} not found`)
        }

        await firestoreMarkAsContacted(leadToMark, notes)

        // Update local state
        setEnhancedLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === placeId
              ? {
                  ...lead,
                  contacted: true,
                  contactedDate: new Date().toISOString(),
                  contactNotes: notes || lead.contactNotes,
                }
              : lead
          )
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to mark as contacted'
        setError(errorMessage)
        throw err
      }
    },
    [enhancedLeads]
  )

  const markAsUncontacted = useCallback(async (placeId: string) => {
    try {
      await firestoreMarkAsUncontacted(placeId)

      // Update local state
      setEnhancedLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === placeId
            ? {
                ...lead,
                contacted: false,
                contactedDate: undefined,
              }
            : lead
        )
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to mark as uncontacted'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateContactInfo = useCallback(
    async (
      placeId: string,
      data: {
        contactPerson?: string
        email?: string
        contactNotes?: string
      }
    ) => {
      try {
        await updateLeadData(placeId, data)

        // Update local state
        setEnhancedLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === placeId
              ? {
                  ...lead,
                  contactPerson: data.contactPerson || lead.contactPerson,
                  email: data.email || lead.email,
                  contactNotes: data.contactNotes || lead.contactNotes,
                }
              : lead
          )
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update contact info'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  return {
    enhancedLeads,
    loading,
    error,
    markAsContacted,
    markAsUncontacted,
    updateContactInfo,
  }
}
