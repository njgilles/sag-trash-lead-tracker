let mapsLoadingPromise: Promise<void> | null = null

export async function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Google Maps can only be loaded on the client side')
  }

  if (mapsLoadingPromise) {
    return mapsLoadingPromise
  }

  if (window.google?.maps) {
    return
  }

  mapsLoadingPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      mapsLoadingPromise = null
      reject(new Error('Failed to load Google Maps API'))
    }

    document.head.appendChild(script)
  })

  return mapsLoadingPromise
}

export function getGoogleMaps(): typeof google.maps {
  if (!window.google?.maps) {
    throw new Error('Google Maps not loaded. Call loadGoogleMaps first.')
  }
  return window.google.maps
}

export const RALEIGH_CENTER = {
  lat: 35.7796,
  lng: -78.6382,
}

export const DEFAULT_ZOOM = 13
