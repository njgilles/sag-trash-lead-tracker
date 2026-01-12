# SAG-Trash Client Finder

A modern lead generation tool for identifying potential customers (pools, HOAs, neighborhoods) in target geographic areas.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Maps API keys (see Setup below)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Google Maps API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - Create two API keys (client and server)
   - Update `.env.local`:
     ```env
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_key
     GOOGLE_MAPS_API_KEY=your_server_key
     ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 (or the port shown in terminal)

### Usage

1. **Enter a search location:** Address, zip code, or city name
2. **Select lead types:** Pools, HOAs, Neighborhoods, or all
3. **Adjust search radius:** 1km to 50km
4. **View results:** Interactive map with markers + scrollable list
5. **Select leads:** Check boxes to select specific leads
6. **Export to CSV:** Download selected leads for outreach

## Features

- 🗺️ **Interactive Map**: Real-time map visualization with custom markers
- 📍 **Lead Discovery**: Identify pools, HOAs, and neighborhoods using Google Places API
- 📋 **Lead Management**: View details, ratings, contact information
- 📥 **CSV Export**: Export leads for CRM integration or follow-up campaigns
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages and API
│   ├── components/       # React components (map, search, results)
│   ├── lib/             # Utilities (maps, places, CSV)
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
├── .env.local           # Environment variables (not committed)
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Next.js 15** - React framework with API routes
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Google Maps API** - Maps and Places data
- **PapaParse** - CSV generation

## Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Public | Yes | Client-side API key for map rendering |
| `GOOGLE_MAPS_API_KEY` | Private | Yes | Server-side API key for Places API |

## API Endpoints

### POST `/api/geocode`
Convert address to coordinates.

**Request:**
```json
{ "address": "Raleigh, NC" }
```

**Response:**
```json
{
  "lat": 35.7796,
  "lng": -78.6382,
  "formattedAddress": "Raleigh, NC, USA"
}
```

### POST `/api/search-places`
Find businesses/places by location and type.

**Request:**
```json
{
  "location": { "lat": 35.7796, "lng": -78.6382 },
  "radius": 5000,
  "types": ["pool", "hoa"],
  "limit": 50
}
```

**Response:**
```json
{
  "leads": [
    {
      "id": "place123",
      "name": "Downtown Swimming Pool",
      "address": "123 Main St, Raleigh, NC",
      "location": { "lat": 35.78, "lng": -78.63 },
      "type": "pool",
      "distance": 0.5,
      "rating": 4.5
    }
  ],
  "searchCenter": { "lat": 35.7796, "lng": -78.6382 },
  "totalResults": 1
}
```

## Troubleshooting

**"API key not configured"**
- Check `.env.local` has both API keys set
- Restart dev server: `npm run dev`

**"Port 3000 in use"**
- Next.js will use the next available port
- Check terminal output for actual port number

**No results found**
- Verify API keys are valid and APIs are enabled in Google Cloud
- Check your search location is valid
- Try a larger search radius

## Future Features

- Custom boundary drawing for search areas
- User authentication & saved searches
- Lead database persistence
- CRM integration (Salesforce, HubSpot)
- Lead scoring algorithm
- Route optimization for sales teams

## Support

For issues or questions, check the [CLAUDE.md](./CLAUDE.md) file for detailed technical documentation.

## License

Copyright © 2026 Southeast Aquatics Trash. All rights reserved.
