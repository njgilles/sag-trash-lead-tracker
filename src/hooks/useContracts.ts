import { useState, useEffect } from 'react'
import { Contract } from '@/types/lead'
import { getAllContracts } from '@/lib/firestore-service'

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllContracts()
      setContracts(data)
    } catch (err) {
      console.error('Error fetching contracts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
  }
}
