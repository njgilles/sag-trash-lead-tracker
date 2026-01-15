export type LeadType = 'pool' | 'hoa' | 'neighborhood' | 'other';

export interface Location {
  lat: number;
  lng: number;
}

export interface Lead {
  id: string;              // Google Place ID or manual ID (manual-{timestamp}-{randomId})
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
  notInterested?: boolean; // Whether user marked as not interested
  notInterestedDate?: string; // ISO date string when marked as not interested
  rejectionReason?: string;  // Reason why not interested

  // Manual lead indicator
  isManual?: boolean;      // Whether this lead was manually created
}

// Contract - represents actual customers with full contract information
export interface Contract {
  id: string;              // Document ID in contracts collection

  // Customer Information
  customerName: string;
  customerAddress1: string;
  customerAddress2?: string;

  // Billing Address
  billingAddress1?: string;
  billingAddress2?: string;

  // Primary Contact Information
  contactEmail?: string;
  contactMobile?: string;
  contactPhone?: string;

  // Site Information
  siteName?: string;
  siteAddress1?: string;
  siteAddress2?: string;
  siteContact?: string;

  // Service Details
  effectiveDate?: string;
  serviceType?: string;

  // Location (geocoded from address)
  location?: Location;

  // Contract Metadata
  contractDate?: string;   // When contract was created
  importedDate: string;    // ISO date string when imported into system
  linkedLeadId?: string;   // Optional link to corresponding lead (if created)
  notes?: string;          // Any additional notes
}

