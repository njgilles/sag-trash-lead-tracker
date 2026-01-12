import { Lead, LeadType, Location } from '@/types/lead'
import { SearchParams, SearchResult } from '@/types/search'

export async function searchPlaces(params: SearchParams): Promise<SearchResult> {
  const response = await fetch('/api/search-places', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to search places')
  }

  return response.json()
}

export async function geocodeAddress(address: string): Promise<Location & { formattedAddress: string }> {
  const response = await fetch('/api/geocode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to geocode address')
  }

  return response.json()
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

export function classifyPlace(name: string, types: string[]): LeadType {
  const nameLower = name.toLowerCase()
  const typesLower = types.map(t => t.toLowerCase())

  // Pool detection
  if (
    nameLower.includes('pool') ||
    nameLower.includes('aquatic') ||
    nameLower.includes('natatorium') ||
    typesLower.includes('swimming_pool')
  ) {
    return 'pool'
  }

  // HOA detection
  if (
    nameLower.includes('hoa') ||
    nameLower.includes('homeowners') ||
    nameLower.includes('association') ||
    nameLower.includes('property management')
  ) {
    return 'hoa'
  }

  // Neighborhood detection
  if (
    typesLower.includes('neighborhood') ||
    typesLower.includes('locality') ||
    typesLower.includes('administrative_area_level_3')
  ) {
    return 'neighborhood'
  }

  return 'other'
}

export function formatPlaceResult(
  placeResult: google.maps.places.PlaceResult,
  location: Location,
  type: LeadType
): Lead {
  const distance = calculateDistance(
    location.lat,
    location.lng,
    placeResult.geometry?.location?.lat() || 0,
    placeResult.geometry?.location?.lng() || 0
  )

  return {
    id: placeResult.place_id || '',
    name: placeResult.name || '',
    address: placeResult.formatted_address || '',
    location: {
      lat: placeResult.geometry?.location?.lat() || 0,
      lng: placeResult.geometry?.location?.lng() || 0,
    },
    type,
    phone: placeResult.formatted_phone_number || placeResult.international_phone_number,
    website: placeResult.website,
    rating: placeResult.rating,
    reviewCount: placeResult.user_ratings_total,
    businessStatus: placeResult.business_status,
    distance: Number((distance * 0.621371).toFixed(2)), // Convert km to miles
    photos: placeResult.photos?.map(photo => photo.getUrl()) || [],
  }
}
