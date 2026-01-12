import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { message: 'Address is required' },
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

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Geocoding API request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' || data.results.length === 0) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    const result = data.results[0]
    const location = result.geometry.location

    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { message: 'Failed to geocode address' },
      { status: 500 }
    )
  }
}
