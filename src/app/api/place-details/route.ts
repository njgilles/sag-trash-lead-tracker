import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { placeIds } = await request.json()

    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return NextResponse.json(
        { message: 'placeIds array is required' },
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

    // Fetch details for each place ID
    const detailsMap: Record<
      string,
      {
        phone?: string
        website?: string
        internationalPhone?: string
      }
    > = {}

    for (const placeId of placeIds) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number,website&key=${apiKey}`
        )

        if (!response.ok) {
          console.error(`Failed to fetch details for place ${placeId}`)
          continue
        }

        const data = await response.json()

        if (data.status === 'OK' && data.result) {
          const result = data.result
          detailsMap[placeId] = {
            phone: result.formatted_phone_number,
            internationalPhone: result.international_phone_number,
            website: result.website,
          }
        }
      } catch (err) {
        console.error(`Error fetching details for place ${placeId}:`, err)
        // Continue with next place ID if one fails
      }
    }

    return NextResponse.json(detailsMap)
  } catch (error) {
    console.error('Place details error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
}
