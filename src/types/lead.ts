export type LeadType = 'pool' | 'hoa' | 'neighborhood' | 'other';

export interface Location {
  lat: number;
  lng: number;
}

export interface Lead {
  id: string;              // Google Place ID
  name: string;
  address: string;
  location: Location;
  type: LeadType;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  businessStatus?: string;
  distance?: number;       // Miles from search center
  notes?: string;
  photos?: string[];       // Photo references from Google

  // Contact information (manual entry)
  contactPerson?: string;  // Contact person name
  email?: string;          // Email address

  // Tracking
  contacted?: boolean;     // Whether lead has been contacted
  contactedDate?: string;  // ISO date string when contacted
  contactNotes?: string;   // Notes about the contact
}
