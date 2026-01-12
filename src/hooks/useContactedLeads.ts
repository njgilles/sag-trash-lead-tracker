import { useState, useEffect, useCallback } from 'react'
import { Lead } from '@/types/lead'

interface UseContactedLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useContactedLeads(): UseContactedLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contacted-leads')

      if (!response.ok) {
        throw new Error('Failed to fetch contacted leads')
      }

      const data = await response.json()

      if (data.success) {
        setLeads(data.data || [])
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching contacted leads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const refetch = useCallback(async () => {
    await fetchLeads()
  }, [fetchLeads])

  return { leads, loading, error, refetch }
}
