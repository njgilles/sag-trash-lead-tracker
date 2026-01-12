import { useState, useCallback, useEffect } from 'react'
import { Lead, LeadType, Location } from '@/types/lead'
import { searchPlaces, geocodeAddress } from '@/lib/places-service'
import { RALEIGH_CENTER } from '@/lib/google-maps'
import { saveSearchState, loadSearchState } from '@/lib/search-cache'

interface SearchParams {
  location: Location | string
  radius: number
  types: LeadType[]
  limit?: number
}

export function useLeadSearch() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchCenter, setSearchCenter] = useState<Location>(RALEIGH_CENTER)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load cached state on mount
  useEffect(() => {
    const cached = loadSearchState()
    if (cached && cached.leads.length > 0) {
      setLeads(cached.leads)
      setSearchCenter(cached.searchCenter)
    }
  }, [])

  const search = useCallback(async (params: SearchParams) => {
    setLoading(true)
    setError(null)

    try {
      let location = params.location

      // If location is a string, geocode it first
      if (typeof location === 'string') {
        const geocoded = await geocodeAddress(location)
        location = { lat: geocoded.lat, lng: geocoded.lng }
      }

      setSearchCenter(location as Location)

      // Search for places
      const result = await searchPlaces({
        location,
        radius: params.radius,
        types: params.types,
        limit: params.limit || 50,
      })

      setLeads(result.leads)

      // Save search state to localStorage
      const stateToSave = {
        leads: result.leads,
        searchCenter: location as Location,
        filters: {
          types: params.types,
          radius: params.radius,
        },
        selectedLeads: [] as string[],
        searchQuery:
          typeof params.location === 'string'
            ? params.location
            : `${location.lat}, ${location.lng}`,
        timestamp: Date.now(),
      }
      saveSearchState(stateToSave)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search places'
      setError(errorMessage)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { leads, searchCenter, loading, error, search }
}
