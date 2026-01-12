import { NextRequest, NextResponse } from 'next/server'
import { SearchParams } from '@/types/search'
import { calculateDistance } from '@/lib/places-service'

const SEARCH_QUERIES = {
  pool: ['swimming pool', 'community pool', 'public pool', 'aquatic center'],
  hoa: ['homeowners association', 'HOA', 'property management', 'community association'],
  neighborhood: ['neighborhood', 'subdivision', 'residential community'],
}

export async function POST(request: NextRequest) {
  try {
    const params = (await request.json()) as SearchParams

    if (!params.location || !params.radius || !params.types || params.types.length === 0) {
      return NextResponse.json(
        { message: 'location, radius, and types are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }

    let location = params.location
    if (typeof location === 'string') {
      // Geocode the address first
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
      )
      const geocodeData = await geocodeResponse.json()

      if (geocodeData.status !== 'OK' || geocodeData.results.length === 0) {
        return NextResponse.json(
          { message: 'Location not found' },
          { status: 404 }
        )
      }

      location = geocodeData.results[0].geometry.location
    }

    const searchCenter = {
      lat: (location as { lat: number; lng: number }).lat,
      lng: (location as { lat: number; lng: number }).lng,
    }
    const allResults = new Map()

    // Search for each type
    for (const type of params.types) {
      const queries = SEARCH_QUERIES[type as keyof typeof SEARCH_QUERIES] || []

      for (const query of queries) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
              query
            )}&location=${searchCenter.lat},${searchCenter.lng}&radius=${params.radius}&key=${apiKey}`
          )

          const data = await response.json()

          if (data.status === 'OK' && data.results) {
            for (const place of data.results) {
              if (!allResults.has(place.place_id)) {
                // Calculate distance
                const distance = calculateDistance(
                  searchCenter.lat,
                  searchCenter.lng,
                  place.geometry.location.lat,
                  place.geometry.location.lng
                )

                // Check if within radius
                if (distance * 1000 <= params.radius) {
                  allResults.set(place.place_id, {
                    id: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    location: {
                      lat: place.geometry.location.lat,
                      lng: place.geometry.location.lng,
                    },
                    type,
                    rating: place.rating,
                    reviewCount: place.user_ratings_total,
                    distance: Number((distance * 0.621371).toFixed(2)), // km to miles
                  })
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error searching for ${query}:`, err)
        }
      }
    }

    const leads = Array.from(allResults.values())
      .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
      .slice(0, params.limit || 50)

    // Fetch detailed contact info for all leads
    try {
      const placeIds = leads.map(lead => lead.id)
      const detailsResponse = await fetch(
        `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/place-details`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placeIds }),
        }
      )

      if (detailsResponse.ok) {
        const details = await detailsResponse.json()

        // Merge details into leads
        leads.forEach(lead => {
          if (details[lead.id]) {
            lead.phone = details[lead.id].phone || lead.phone
            lead.website = details[lead.id].website || lead.website
          }
        })
      }
    } catch (err) {
      console.error('Error fetching place details:', err)
      // Continue without details if fetch fails
    }

    return NextResponse.json({
      leads,
      searchCenter,
      totalResults: leads.length,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Search places error:', error)
    return NextResponse.json(
      { message: 'Failed to search places' },
      { status: 500 }
    )
  }
}
