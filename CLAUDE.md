# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Client Finder** is a lead generation tool for Southeast Aquatics Trash (SAG-Trash). It enables sales teams to search a geographic area and identify potential customers including:
- Swimming pools
- HOAs (Homeowners Associations)
- Neighborhoods and subdivisions

The app uses the Google Places API to find and map these leads in target regions.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with @tailwindcss/postcss
- **Mapping**: Google Maps JavaScript API
- **Data Format**: CSV export for lead lists
- **Runtime**: Node.js with Edge Functions support

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout with AuthProvider & LayoutWithNav
│   ├── page.tsx                          # Redirect to /map or /login (auth check)
│   ├── map/page.tsx                      # Map screen - search & lead discovery
│   ├── login/page.tsx                    # Login screen - AWS Cognito placeholder
│   ├── contacts/page.tsx                 # Contacts screen - contacted leads table
│   ├── globals.css                       # Global styles
│   └── api/
│       ├── search-places/                # Places API integration
│       ├── geocode/                      # Address geocoding
│       ├── place-details/                # Place detail fetching
│       └── contacted-leads/              # Fetch all contacted leads
├── components/
│   ├── map/GoogleMap.tsx                 # Interactive map with markers
│   ├── search/                           # SearchBar & SearchFilters
│   ├── results/                          # ResultsList & LeadCard
│   ├── leads/                            # LeadDetailsModal & ContactFields
│   ├── export/ExportButton.tsx           # CSV export
│   ├── navigation/
│   │   ├── TabNav.tsx                    # Top navigation tabs
│   │   └── LayoutWithNav.tsx             # Layout wrapper with nav
│   ├── contacts/
│   │   ├── ContactsTable.tsx             # Contacted leads table view
│   │   └── ContactsFilters.tsx           # Filter & sort controls
│   ├── email/EmailModal.tsx              # Email composition modal
│   └── providers/AuthProvider.tsx        # Auth context wrapper
├── context/
│   └── AuthContext.tsx                   # Authentication state (mock + Cognito)
├── lib/
│   ├── google-maps.ts                    # Maps API loader
│   ├── places-service.ts                 # Places API wrapper & utilities
│   ├── csv-export.ts                     # CSV generation
│   ├── firebase.ts                       # Firebase initialization
│   ├── firestore-service.ts              # Firestore CRUD operations
│   └── email-templates.ts                # Email template definitions
├── types/
│   ├── lead.ts                           # Lead data structure
│   └── search.ts                         # Search parameters & results
└── hooks/
    ├── useGoogleMaps.ts                  # Maps initialization hook
    ├── useLeadSearch.ts                  # Search state management
    ├── useLeadData.ts                    # Firestore sync for leads
    └── useContactedLeads.ts              # Fetch contacted leads
```

## Common Commands

### Development
```bash
npm run dev
# App runs on http://localhost:3000 (or next available port)
```

### Build & Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## Environment Setup

### Required: Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Google Maps JavaScript API
   - Places API
   - Geocoding API

4. Create two API keys:
   - **Client Key** (for browser, with HTTP referrer restrictions)
   - **Server Key** (for Node.js backend, with IP restrictions)

5. Update `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_key
GOOGLE_MAPS_API_KEY=your_server_key
```

**Important:** Never commit `.env.local` to git.

## Architecture Notes

### Multi-Screen Architecture

The app now uses Next.js App Router with three main screens:

1. **Login Screen** (`/login`)
   - Email/password form (mock auth + AWS Cognito placeholder)
   - Redirects to `/map` on successful login
   - Accessible without authentication

2. **Map Screen** (`/map`)
   - Lead search and discovery
   - Interactive Google Maps visualization
   - Real-time filtering and marking leads as contacted
   - CSV export functionality
   - Protected route (redirects to `/login` if not authenticated)

3. **Contacts Screen** (`/contacts`)
   - Table view of all contacted leads
   - Filtering by type, sorting, and search
   - Email composition with pre-built templates
   - Protected route (redirects to `/login` if not authenticated)

### Authentication Flow

1. User visits `/` → AuthContext checks localStorage for session
2. If authenticated: redirects to `/map`, else redirects to `/login`
3. Login form calls `AuthContext.signIn(email, password)`
4. Mock auth succeeds with any credentials (localStorage storage)
5. Future: AWS Cognito integration points marked with `// TODO:` comments
6. Logout clears localStorage and redirects to `/login`

### Search & Contact Tracking Flow

1. User navigates to Map screen
2. Enters location and selects filters
3. Frontend calls `/api/geocode` → `/api/search-places`
4. Results displayed as map markers + sidebar list
5. User clicks "Mark as Contacted" on lead
6. Full lead object + metadata stored to Firestore (doc ID = placeId)
7. User visits Contacts screen
8. Frontend calls `/api/contacted-leads`
9. Firestore query returns all leads where `contacted = true`
10. Results displayed in sortable/filterable table

### API Routes

- **`/api/geocode`** - Convert address strings to coordinates
- **`/api/search-places`** - Find businesses/places by type and radius
- **`/api/place-details`** - Fetch detailed place info (phone/website)
- **`/api/contacted-leads`** - Fetch all contacted leads (sorted by date)

All are server-side only to protect API keys.

### Component Hierarchy

**Layout Structure:**
```
RootLayout
├── AuthProvider
│   └── LayoutWithNav
│       ├── TabNav (navigation tabs)
│       └── Route Content
│           ├── /map → MapPage
│           ├── /login → LoginPage
│           └── /contacts → ContactsPage
```

**Map Page:**
```
MapPage
├── SearchBar (address input)
├── SearchFilters (type/radius)
├── GoogleMap (markers visualization)
├── ResultsList
│   └── LeadCard[] (clickable leads)
└── ExportButton (CSV download)
```

**Contacts Page:**
```
ContactsPage
├── Header
├── ContactsFilters (type/sort/search)
├── ContactsTable (leads list)
│   └── EmailModal (template selection)
└── (Empty state when no contacts)
```

### Styling
- Tailwind CSS utility classes in components
- Custom CSS for map/marker styling in `globals.css`
- SAG brand colors: cyan (#00bcd4), dark (#0097a7)
- Type badge colors: Pool (red), HOA (blue), Neighborhood (green), Other (purple)
- Responsive design: sidebar collapses on mobile, table scrolls horizontally

## Key Implementation Details

### Maps Initialization
- Google Maps API loaded dynamically via script injection (`lib/google-maps.ts`)
- Uses custom marker SVGs with type-specific colors
- Auto-fits map bounds to show all search results
- Info windows show lead details on marker click

### Places Search Strategy
The API uses text search with specific queries for each lead type:
- **Pools**: "swimming pool", "community pool", "aquatic center"
- **HOAs**: "homeowners association", "property management", "community association"
- **Neighborhoods**: "neighborhood", "subdivision", "residential community"

Results filtered by business status and distance from search center.

### CSV Export
- Uses `papaparse` library
- Includes columns: Name, Address, Type, Phone, Website, Rating, Distance, Notes
- Proper CSV escaping for special characters
- Downloads as `sag-leads-[date].csv`

### Email Integration
- Pre-built templates for outreach: Initial Outreach, Follow-Up, Seasonal Reminder
- Template placeholders: {{name}}, {{address}}, {{contactPerson}}
- User can select template, edit subject/body, and copy to clipboard
- Copy-to-Clipboard button copies full email (subject + body)
- Email sending currently via clipboard → user's email client
- Future: Gmail API / AWS SES integration for automatic sending

### Firestore Lead Storage
- Stores full Lead objects (not just metadata) when marked as contacted
- Document ID = placeId (matches Google Places ID)
- Includes: place data (name, address, type, etc.) + contact metadata (person, email, notes)
- Queried for Contacts screen with: `where('contacted', '==', true).orderBy('contactedDate', 'desc')`
- Enables Contacts screen to display leads without re-querying Google Places API

## Development Patterns

### Adding a New Lead Type
1. Add to `LeadType` union in `src/types/lead.ts`
2. Add search queries in `src/app/api/search-places/route.ts`
3. Add marker color in `src/components/map/GoogleMap.tsx`
4. Add badge styling in `src/components/results/LeadCard.tsx`

### Handling API Errors
- Client errors handled in `useLeadSearch` hook
- API errors returned with meaningful messages
- User-facing error displayed in sidebar

### Performance Considerations
- Maps API loads only on client side
- Search results cached in React state
- Debounce search input in future versions
- Marker clustering for 50+ results (future enhancement)

## Testing the App Locally

### Setup
1. Set up Google Maps API keys in `.env.local`
2. Set up Firebase credentials
3. Run `npm run dev`
4. Open http://localhost:3000

### Login Screen Testing
- Try logging in with any email/password (mock auth accepts anything)
- Verify redirect to `/map` after login
- Click "Logout" button to test logout flow

### Map Screen Testing
- Search by address: "Raleigh, NC" or by zip: "27603"
- Verify results display as map markers and sidebar cards
- Click markers to see info windows
- Toggle lead selection checkboxes
- Use filters to narrow results by type and radius
- Click "Mark as Contacted" on a lead
- Verify lead is marked with contact date/notes

### Contacts Screen Testing
- Navigate to Contacts tab
- Verify only previously "contacted" leads appear
- Use filters: type, sort, search by name/address
- Click "Email" button to open email modal
- Select different templates and verify placeholders fill
- Click "Copy to Clipboard" and paste into email client
- Click "Details" to view lead information

### Firestore Verification
- Mark a lead as contacted on Map screen
- Check Firestore console: collection → leads → placeId
- Verify full lead data is stored (name, address, type, etc.)

## Future Enhancements

### Phase 2: AWS Cognito Integration
- Replace mock auth with real Cognito user pool
- Add user signup flow
- Add password reset flow
- Store user-specific leads (multi-tenant with Firestore rules)

### Phase 2: Email Sending
- Gmail API integration with OAuth 2.0
- AWS SES for transactional emails
- Email open/click tracking
- Sent email history per lead

### Phase 3: Advanced Features
- Drawing tools for custom search boundaries
- Lead scoring algorithm (response likelihood)
- CRM integration (Salesforce, HubSpot)
- Route optimization for sales visits
- Lead pipeline stages (contacted → quoted → closed)
- Contact follow-up reminders

### Future: Mobile & Analytics
- React Native mobile app
- Analytics dashboard (contact rates, lead sources, conversion funnel)
- Heatmap visualization
- Batch geocoding for address lists
- Export history and reporting

## Deployment

Currently configured for local development. For AWS deployment:
- Build: `npm run build` creates optimized bundle
- Deploy to AWS Amplify, EC2, or Lambda with Vercel/Netlify
- Update API keys with production values
- Set up environment-specific configurations

## Troubleshooting

**"API key not configured"**
- Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Restart dev server after updating env vars

**"Port 3000 in use"**
- Dev server uses next available port (check CLI output)
- Kill existing process: `pkill -f "next dev"`

**No results found**
- Verify API keys are valid and APIs are enabled
- Check Google Cloud Console quotas
- Try different search terms or locations

**TypeScript errors**
- Run `npm run lint` to check all files
- Most errors require type assertions for Google Maps API responses
