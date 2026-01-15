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
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **Mapping**: Google Maps JavaScript API
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication (email/password)
- **Deployment**: Firebase App Hosting
- **Secrets Management**: Google Cloud Secret Manager
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
│   └── AuthContext.tsx                   # Authentication state (Firebase Auth)
├── lib/
│   ├── google-maps.ts                    # Maps API loader
│   ├── places-service.ts                 # Places API wrapper & utilities
│   ├── csv-export.ts                     # CSV generation
│   ├── firebase.ts                       # Firebase client SDK initialization
│   ├── firebase-admin.ts                 # Firebase Admin SDK initialization (server-side)
│   ├── firestore-service.ts              # Firestore CRUD operations (client-side)
│   ├── firestore-admin-service.ts        # Firestore operations (server-side Admin SDK)
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

### Required: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing `sag-trash-lead-tracker`
3. Enable Firebase Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider
   - Create test user accounts in Authentication → Users
4. Enable Firestore Database:
   - Go to Firestore Database → Create database
   - Start in production mode (security rules require auth)
5. Get Firebase config from Project Settings → General → Your apps
6. Update `.env.local` with Firebase Web SDK config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Required: Firebase Admin SDK (for server-side operations)

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the `private_key` and `client_email` fields
5. Add to `.env.local` (multi-line key format):
```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKjMzEfYyjiWA4...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important:** Never commit `.env.local` or service account JSON to git.

## Architecture Notes

### Multi-Screen Architecture

The app now uses Next.js App Router with three main screens:

1. **Login Screen** (`/login`)
   - Email/password form using Firebase Authentication
   - Validates credentials against Firebase user pool
   - Redirects to `/map` on successful login
   - Displays Firebase auth error messages (wrong password, user not found, etc.)
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

1. User visits `/` → AuthContext checks Firebase auth state via `onAuthStateChanged`
2. If authenticated: redirects to `/map`, else redirects to `/login`
3. Login form calls `AuthContext.signIn(email, password)`
4. Firebase Authentication validates credentials and returns JWT token
5. Token automatically included in Firestore requests (enforced by security rules)
6. Logout calls `signOut()` from Firebase Auth and redirects to `/login`

**Note:** Users must be created in Firebase Console or via sign-up flow. The app uses Firebase Authentication, not AWS Cognito or mock auth.

### Firebase SDK Architecture

The app uses **two separate Firebase SDKs** for different environments:

**Client SDK** (`src/lib/firebase.ts`)
- Used: Browser components and client-side operations
- SDK: `firebase` npm package
- Operations: User authentication, real-time Firestore updates, client-side queries
- Config: Uses `NEXT_PUBLIC_*` environment variables
- Auth: Uses browser-stored authentication tokens from Firebase Auth

**Admin SDK** (`src/lib/firebase-admin.ts`)
- Used: Server-side API routes (Node.js)
- SDK: `firebase-admin` npm package
- Operations: Privileged Firestore queries, server-side operations
- Config: Uses service account credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- Auth: Bypasses security rules with elevated privileges
- Example: `/api/contacted-leads` uses Admin SDK to query `leads` collection

This separation is necessary because:
- Client SDK requires browser globals (window, localStorage) - doesn't work in Node.js
- Admin SDK provides elevated privileges needed for server-side operations
- Client-side queries are still protected by Firestore security rules
- Server-side queries are isolated to trusted API routes

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
- Document ID = placeId (matches Google Places ID) or manual-{timestamp}-{randomId} for manual leads
- Includes: place data (name, address, type, location, etc.) + contact metadata + status
- Lead fields stored:
  - Basic: `name`, `address`, `type`, `location` (lat/lng), `phone`, `website`, `notes`
  - Contact: `contactPerson`, `email`, `contactNotes`
  - Status: `contacted`, `contactedDate`, `notInterested`, `notInterestedDate`, `rejectionReason`
  - Metadata: `isManual` (true for manually created leads), `createdDate`, `lastUpdated`
- Queried for Contacts screen with: `where('contacted', '==', true).orderBy('contactedDate', 'desc')`
- Requires composite index on `contacted` (Ascending) + `contactedDate` (Descending)
- Enables Contacts screen to display leads without re-querying Google Places API
- Deleted leads completely removed from Firestore with `deleteDoc()`

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
**Prerequisites:**
- Firebase Email/Password authentication must be enabled in Console
- At least one user account must exist in Firebase Authentication

**Testing:**
- Try logging in with valid Firebase user credentials
- Test invalid password (should show "Incorrect password")
- Test non-existent email (should show "No account found with this email")
- Verify redirect to `/map` after successful login
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
**Prerequisites:** User must be logged in with Firebase Authentication

- Mark a lead as contacted on Map screen
- Check Firestore console: collection → leads → placeId
- Verify full lead data is stored (name, address, type, etc.)
- Verify `contacted: true` and `contactedDate` timestamp
- Try accessing Firestore while logged out (should fail with permission error)

## Recent Updates (January 2026)

### ✅ Completed Features

1. **Manual Lead Entry** (`/contacts` page)
   - Users can create manual leads from the Contacts page
   - Form fields: Business Name, Address (required), Type, Contact Info, Notes
   - Address is automatically geocoded to get coordinates
   - Manual leads are automatically marked as contacted when created
   - Manual leads immediately appear in the Contacts table

2. **Lead Status Indicators**
   - Map markers now show checkmark (✓) for contacted leads
   - Map markers show X (✕) for "Not Interested" leads
   - Sidebar cards show status badges with visual feedback
   - Reduced opacity for contacted/rejected leads

3. **Not Interested Status**
   - Users can mark leads as "Not Interested" with optional rejection reason
   - Tracked with `notInterested`, `notInterestedDate`, and `rejectionReason` fields
   - Visual indicator: red X badge on cards and markers

4. **Lead Deletion**
   - Users can delete leads from both `/map` and `/contacts` pages
   - Delete button in lead details modal (red button, footer)
   - Confirmation dialog prevents accidental deletion
   - Deleted leads immediately removed from Firestore database
   - UI automatically refreshes after deletion

5. **Inline Editable Fields**
   - Quick edit capability for lead contact information
   - Fields: Contact Person, Email, Contact Notes
   - Auto-save on blur with visual feedback (loading spinner → checkmark)
   - Keyboard shortcuts: Enter to save, Escape to cancel
   - Sync changes back to Firestore

6. **Improved Geocoding**
   - `/api/geocode` endpoint fixed to return proper response format
   - Returns `{ success: true, location: { lat, lng }, ... }`
   - Automatic address-to-coordinates conversion
   - Manual leads use same geocoding as API-found leads

### Current Implementation Details

**Manual Lead Workflow:**
1. User creates manual lead on `/contacts` page
2. Form fields validated (name and address required)
3. Address automatically geocoded via `/api/geocode`
4. Lead saved to Firestore with `isManual: true`
5. Lead automatically marked as `contacted: true`
6. Contacts list refetched to show new lead
7. Details modal opens for additional info

**Lead Status Management:**
- Three status states: default (uncontacted), contacted, not interested
- Buttons disabled appropriately based on current status
- Status transitions stored in Firestore with timestamps
- Visual indicators across map markers, cards, and modals

**Data Persistence:**
- All lead operations sync with Firestore
- Firestore Admin SDK for server-side operations
- Client-side SDK for user operations
- Proper error handling with user-facing messages

## Future Enhancements

### Phase 2: Enhanced Authentication ✅ Firebase Auth Complete
Firebase Authentication is fully implemented with email/password login.

**Future improvements:**
- Add user sign-up flow in the app (currently manual in Firebase Console)
- Add password reset/forgot password flow
- Add email verification before allowing login
- Multi-tenant support: store user-specific leads with Firebase Firestore rules (`request.auth.uid == userId`)
- Social login: Google Sign-In, GitHub Sign-In

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

### Firebase App Hosting (Current)

The app is deployed to Firebase App Hosting with environment-based configuration:

1. **Configuration File**: `apphosting.yaml`
   - Defines environment variables and build configuration
   - References secrets from Google Cloud Secret Manager
   - Configures build settings for Next.js (with `@framework` directive)

2. **Secrets Management**:
   - API keys stored in Google Cloud Secret Manager (never in source control)
   - Accessed via `firebase apphosting:secrets:set` command
   - Access granted to backend service via `firebase apphosting:secrets:grantaccess`
   - Never commit secrets to git or apphosting.yaml

3. **Deploy Command**:
   ```bash
   firebase deploy
   ```
   This deploys both the app code and any updated Firestore rules.

4. **Environment Variables**:
   - Production secrets loaded from Google Cloud Secret Manager at build time
   - Public Firebase config embedded in `apphosting.yaml`
   - Local development uses `.env.local` (never committed to git)

5. **Firestore Security Rules**:
   - Rules file: `firestore.rules`
   - Current rule: `allow read, write: if request.auth != null;`
   - Requires authentication for all Firestore operations
   - Deploy with: `firebase deploy --only firestore:rules`

### Alternative Deployment Options

- **Vercel**: Connect GitHub repo, auto-deploy on push (runs `npm run build` and `npm run start`)
- **AWS Amplify**: Use `amplify.yml` configuration for build and deploy
- **Docker**: Build image with `npm run build`, serve with `npm run start`
- **Self-hosted**: Traditional Node.js server with PM2/systemd for process management

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

**"Missing or insufficient permissions" (Firestore)**
- Ensure you're logged in with Firebase Authentication
- Check Firestore rules require authentication: `request.auth != null`
- Verify Firebase Auth is properly initialized in `src/lib/firebase.ts`
- Open browser DevTools Console and check for auth token in network requests
- Try reloading page after successful login to ensure auth state is established

**"Function setDoc() called with invalid data. Unsupported field value: undefined"**
- This error occurs when trying to write `undefined` values to Firestore (Firestore doesn't allow undefined)
- Fixed in `src/lib/firestore-service.ts` by filtering undefined fields in:
  - `markAsContacted()` function (line ~87-89)
  - `updateLeadData()` function (line ~57-60)
- If error persists, check that lead objects don't contain undefined optional fields
- Use browser DevTools to inspect lead objects being sent to Firestore

**Tailwind CSS won't load / "Can't resolve 'tailwindcss'" error**
- Clear Next.js build cache: `rm -rf .next`
- Remove node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Restart dev server: `npm run dev`
- Check that `postcss.config.js` includes `'@tailwindcss/postcss'` plugin
- Verify `src/app/globals.css` starts with `@import "tailwindcss";`

**Firebase Authentication not working**
- Verify Email/Password provider is enabled in Firebase Console
- Check Firebase config in `.env.local` matches your Firebase project
- Ensure user accounts exist in Firebase Authentication → Users
- Check browser DevTools Console for Firebase auth errors
- Verify `.env.local` is loaded (restart dev server after changes)
- Look for error codes like "auth/user-not-found", "auth/wrong-password"

**"The query requires an index" (Firestore - /contacts page)**
- This error occurs when querying Firestore with both a `where` clause and `orderBy` on different fields
- Required composite index: Collection `leads`, Fields: `contacted` (Ascending) + `contactedDate` (Descending)
- **Fix:**
  1. Check server console for error with auto-creation URL: `https://console.firebase.google.com/v1/r/project/.../firestore/indexes?create_composite=...`
  2. Click the URL to automatically create the index in Firebase Console
  3. Wait 1-5 minutes for the index to build (you'll see status "Enabled")
  4. Refresh the `/contacts` page - it should now load data successfully
  5. If error persists, manually create the index:
     - Go to [Firebase Console](https://console.firebase.google.com/) → Firestore Database → Indexes
     - Create composite index on collection `leads`
     - Add fields: `contacted` (Ascending), then `contactedDate` (Descending)
     - Wait for "Enabled" status
- This is a one-time setup per Firebase project

**Firebase Admin SDK environment variables missing**
- The app uses Firebase Admin SDK for server-side API operations (e.g., `/api/contacted-leads`)
- Required environment variables in `.env.local`:
  ```env
  FIREBASE_PROJECT_ID=your_project_id
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
  ```
- **To get these credentials:**
  1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
  2. Click "Generate new private key" and download the JSON file
  3. Extract the `projectId`, `client_email`, and `private_key` fields
  4. Add to `.env.local` with proper newline escaping (use `\n` in the key, not actual newlines)
- **Note:** Never commit `.env.local` to git
- If you see "Missing Firebase Admin credentials" error, verify all three variables are set and properly formatted

**Manual leads not appearing in Contacts page**
- Manual leads must be automatically marked as `contacted: true` when created
- Fix: `handleManualLeadCreated()` in `/contacts/page.tsx` calls `markAsContacted()` then `refetch()`
- After creating manual lead, the contacts list is automatically refetched to show the new lead
- If lead still doesn't appear, check browser DevTools Console for errors

**Deleted leads still appearing in UI**
- After deletion, the page calls `refetch()` to sync Firestore data with UI
- If deleted lead still appears, the refetch may have failed - check console errors
- Manual refresh (Ctrl+R) will force reload from Firestore
- Verify lead is actually deleted in Firestore Console

**Geocoding errors when creating manual lead**
- Error: "Could not find coordinates for address"
- Causes: Invalid address, special characters, or API rate limit
- Fix: Verify address format (e.g., "123 Main St, City, State 12345")
- Check Google Cloud Console for Geocoding API usage/quotas
- Try simplified address without apartment numbers or special characters
