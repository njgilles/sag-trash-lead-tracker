import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps, getGoogleMaps } from '@/lib/google-maps'

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (loadingRef.current || isLoaded) return

    loadingRef.current = true

    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true)
      })
      .catch(err => {
        setError(err.message || 'Failed to load Google Maps')
        console.error('Error loading Google Maps:', err)
      })
      .finally(() => {
        loadingRef.current = false
      })
  }, [isLoaded])

  return { isLoaded, error }
}

export function useGoogleMapsAPI() {
  const { isLoaded } = useGoogleMaps()

  if (isLoaded) {
    try {
      return getGoogleMaps()
    } catch (err) {
      return null
    }
  }

  return null
}
