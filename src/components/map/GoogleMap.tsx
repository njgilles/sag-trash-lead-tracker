'use client'

import { useEffect, useRef } from 'react'
import { Lead, Location } from '@/types/lead'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { getGoogleMaps, RALEIGH_CENTER, DEFAULT_ZOOM } from '@/lib/google-maps'

interface GoogleMapProps {
  leads: Lead[]
  contractedLeads?: Lead[]
  searchCenter?: Location
  selectedLeads?: Set<string>
  radius?: number
}

const MARKER_COLORS = {
  pool: '#ef4444', // red
  hoa: '#3b82f6', // blue
  neighborhood: '#22c55e', // green
  other: '#8b5cf6', // purple
}

const CONTRACTED_MARKER_COLOR = '#f59e0b' // amber/gold for contracted clients

export function GoogleMap({ leads, contractedLeads = [], searchCenter = RALEIGH_CENTER, selectedLeads, radius }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const radiusCircleRef = useRef<google.maps.Circle | null>(null)

  const { isLoaded } = useGoogleMaps()

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) {
      return
    }

    const maps = getGoogleMaps()
    const map = new maps.Map(mapRef.current, {
      zoom: DEFAULT_ZOOM,
      center: searchCenter,
      styles: [
        {
          featureType: 'water',
          stylers: [{ color: '#00bcd4' }, { lightness: 20 }],
        },
      ],
    })

    mapInstanceRef.current = map
  }, [isLoaded, searchCenter])

  // Update search center marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) {
      return
    }

    mapInstanceRef.current.setCenter(searchCenter)

    // Clear old search center marker
    const key = 'search-center'
    const oldMarker = markersRef.current.get(key)
    if (oldMarker) {
      oldMarker.setMap(null)
      markersRef.current.delete(key)
    }

    // Add new search center marker
    const maps = getGoogleMaps()
    const marker = new maps.Marker({
      position: searchCenter,
      map: mapInstanceRef.current,
      title: 'Search Center',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    })

    markersRef.current.set(key, marker)
  }, [searchCenter, isLoaded])

  // Draw search radius circle
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !radius) {
      return
    }

    // Clear old circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null)
    }

    // Draw new circle
    const maps = getGoogleMaps()
    radiusCircleRef.current = new maps.Circle({
      center: searchCenter,
      radius: radius, // in meters
      fillColor: '#00bcd4',
      fillOpacity: 0.1,
      strokeColor: '#00bcd4',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    })

    radiusCircleRef.current.setMap(mapInstanceRef.current)
  }, [searchCenter, radius, isLoaded])

  // Update lead markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) {
      return
    }

    const maps = getGoogleMaps()

    // Combine both search results and contracted leads
    const allLeads = [...leads, ...contractedLeads]
    const contractedLeadIds = new Set(contractedLeads.map(l => l.id))

    // Remove old markers
    const leadIds = new Set(allLeads.map(l => l.id))
    for (const [key, marker] of markersRef.current.entries()) {
      if (key !== 'search-center' && !leadIds.has(key)) {
        marker.setMap(null)
        markersRef.current.delete(key)
      }
    }

    // Add/update all lead markers
    for (const lead of allLeads) {
      let marker = markersRef.current.get(lead.id)

      // Determine color: gold for contracted leads, type-based for search results
      const isContracted = contractedLeadIds.has(lead.id)
      const markerColor = isContracted ? CONTRACTED_MARKER_COLOR : MARKER_COLORS[lead.type]

      if (!marker) {
        marker = new maps.Marker({
          position: lead.location,
          map: mapInstanceRef.current,
          title: lead.name,
          icon: createMarkerIcon(
            markerColor,
            1,
            lead.contacted,
            lead.notInterested,
            lead.isManual,
            isContracted
          ),
        })

        marker.addListener('click', () => {
          // Close previous info window
          infoWindowRef.current?.close()

          // Create and show new info window
          const infoWindow = new maps.InfoWindow({
            content: createInfoWindowContent(lead, isContracted),
            maxWidth: 300,
          })

          infoWindow.open(mapInstanceRef.current, marker)
          infoWindowRef.current = infoWindow
        })

        markersRef.current.set(lead.id, marker)
      }

      // Update marker appearance based on selection and status
      const isSelected = selectedLeads?.has(lead.id)
      marker.setIcon(
        createMarkerIcon(
          markerColor,
          isSelected ? 0.8 : 1,
          lead.contacted,
          lead.notInterested,
          lead.isManual,
          isContracted
        )
      )
    }

    // Auto-fit bounds if leads exist
    if (allLeads.length > 0) {
      const bounds = new maps.LatLngBounds()
      bounds.extend(searchCenter)
      allLeads.forEach(lead => {
        bounds.extend(lead.location)
      })
      mapInstanceRef.current.fitBounds(bounds, 100)
    }
  }, [leads, contractedLeads, selectedLeads, isLoaded])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden shadow-lg"
    />
  )
}

function createMarkerIcon(
  color: string,
  opacity: number = 1,
  contacted?: boolean,
  notInterested?: boolean,
  isManual?: boolean,
  isContracted?: boolean
): string {
  // Determine status indicator properties
  let statusIndicator = ''

  if (contacted) {
    // Green circle with checkmark in bottom-right
    statusIndicator = `
      <circle cx="26" cy="30" r="6" fill="#22c55e" stroke="white" stroke-width="1.5"/>
      <text x="26" y="32" font-size="9" font-weight="bold" text-anchor="middle" fill="white">✓</text>
    `
  } else if (notInterested) {
    // Red circle with X in bottom-right
    statusIndicator = `
      <circle cx="26" cy="30" r="6" fill="#ef4444" stroke="white" stroke-width="1.5"/>
      <text x="26" y="32" font-size="10" font-weight="bold" text-anchor="middle" fill="white">✕</text>
    `
  }

  // Add indicator for contracted client if not already marked as contacted
  if (isContracted && !statusIndicator) {
    // Gold/amber star for contracted client
    statusIndicator = `
      <circle cx="26" cy="30" r="6" fill="#1f2937" stroke="white" stroke-width="1.5"/>
      <text x="26" y="32" font-size="10" font-weight="bold" text-anchor="middle" fill="#f59e0b">★</text>
    `
  }

  // Manual lead indicator: dashed border and star icon
  const borderDasharray = isManual ? '3,2' : 'none'
  const centerIcon = isManual
    ? `<path d="M16 10l2.5 7.5h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z" fill="white"/>`
    : `<circle cx="16" cy="16" r="5" fill="white"/>`

  const svgString = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 7.73 16 24 16 24s16-16.27 16-24c0-8.84-7.16-16-16-16z" fill="${color}" opacity="${opacity}" stroke="white" stroke-width="2" ${isManual ? `stroke-dasharray="${borderDasharray}"` : ''}/>
      ${centerIcon}
      ${statusIndicator}
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`
}

function createInfoWindowContent(lead: Lead, isContracted: boolean = false): string {
  const ratingHtml = lead.rating
    ? `<div class="text-yellow-500 text-sm">⭐ ${lead.rating}${lead.reviewCount ? ` (${lead.reviewCount} reviews)` : ''}</div>`
    : ''

  const phoneHtml = lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''
  const websiteHtml = lead.website ? `<p><strong>Website:</strong> <a href="${lead.website}" target="_blank">Open</a></p>` : ''
  const distanceHtml = lead.distance ? `<p><strong>Distance:</strong> ${lead.distance} mi</p>` : ''

  // Status indicator
  let statusHtml = ''
  if (lead.contacted) {
    statusHtml = `<p style="margin: 5px 0; font-size: 12px; color: #22c55e;"><strong>✓ Contacted</strong></p>`
  } else if (lead.notInterested) {
    statusHtml = `<p style="margin: 5px 0; font-size: 12px; color: #ef4444;"><strong>✕ Not Interested</strong></p>`
  } else if (isContracted) {
    statusHtml = `<p style="margin: 5px 0; font-size: 12px; color: #f59e0b;"><strong>★ Current Customer</strong></p>`
  }

  // Manual lead indicator
  const manualBadge = lead.isManual ? `<p style="margin: 5px 0; font-size: 11px; color: #8b5cf6; font-style: italic;">★ Manually Created</p>` : ''

  return `
    <div style="font-family: sans-serif; width: 250px;">
      <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${lead.name}</h3>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">${lead.address}</p>
      <p style="margin: 5px 0; font-size: 12px;"><strong>Type:</strong> ${lead.type}</p>
      ${manualBadge}
      ${statusHtml}
      ${ratingHtml}
      ${phoneHtml}
      ${websiteHtml}
      ${distanceHtml}
    </div>
  `
}
