import { Lead, LeadType, Location } from './lead';

export interface SearchParams {
  location: Location | string;  // Coordinates or address string
  radius: number;               // In meters
  types: LeadType[];
  limit?: number;
}

export interface SearchResult {
  leads: Lead[];
  searchCenter: Location;
  totalResults: number;
  timestamp: number;
}

export interface GeocodeResult {
  location: Location;
  formattedAddress: string;
  placeId?: string;
}
