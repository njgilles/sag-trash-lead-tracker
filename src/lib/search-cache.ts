import { Lead, LeadType, Location } from '@/types/lead'

export interface PersistedSearchState {
  leads: Lead[]
  searchCenter: Location
  filters: {
    types: LeadType[]
    radius: number
  }
  selectedLeads: string[] // Array of lead IDs
  searchQuery: string // Original search query for UX
  timestamp: number // For cache expiration
}

const CACHE_KEY = 'sag_search_state'
const CACHE_EXPIRATION_MS = 60 * 60 * 1000 // 1 hour

/**
 * Save search state to localStorage
 */
export function saveSearchState(state: PersistedSearchState): void {
  try {
    const stateWithTimestamp = {
      ...state,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(stateWithTimestamp))
  } catch (error) {
    console.error('Error saving search state:', error)
  }
}

/**
 * Load search state from localStorage
 * Returns null if not found, expired, or invalid
 */
export function loadSearchState(): PersistedSearchState | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const state = JSON.parse(cached) as PersistedSearchState

    // Check if expired
    const age = Date.now() - state.timestamp
    if (age > CACHE_EXPIRATION_MS) {
      clearSearchState()
      return null
    }

    return state
  } catch (error) {
    console.error('Error loading search state:', error)
    return null
  }
}

/**
 * Clear cached search state
 */
export function clearSearchState(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Error clearing search state:', error)
  }
}
