import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import { Lead } from '@/types/lead'

export interface LeadMetadata {
  contactPerson?: string
  email?: string
  contacted?: boolean
  contactedDate?: Timestamp | null
  contactNotes?: string
  notInterested?: boolean
  notInterestedDate?: Timestamp | null
  rejectionReason?: string
  lastUpdated?: Timestamp
}

/**
 * Get lead metadata from Firestore
 */
export async function getLeadData(
  placeId: string
): Promise<LeadMetadata | null> {
  try {
    const docRef = doc(db, 'leads', placeId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as LeadMetadata
    }
    return null
  } catch (error) {
    console.error('Error fetching lead data:', error)
    throw error
  }
}

/**
 * Update lead metadata in Firestore
 */
export async function updateLeadData(
  placeId: string,
  data: LeadMetadata
): Promise<void> {
  try {
    const docRef = doc(db, 'leads', placeId)
    const existingDoc = await getDoc(docRef)

    // Filter out undefined values (Firestore doesn't allow undefined)
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    )

    if (existingDoc.exists()) {
      // Document exists, update it
      await updateDoc(docRef, {
        ...cleanedData,
        lastUpdated: serverTimestamp(),
      })
    } else {
      // Document doesn't exist, create it
      await setDoc(docRef, {
        ...cleanedData,
        lastUpdated: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error('Error updating lead data:', error)
    throw error
  }
}

/**
 * Mark lead as contacted (stores full lead data)
 */
export async function markAsContacted(
  lead: Lead,
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'leads', lead.id)

    // Filter out undefined values from lead object (Firestore doesn't allow undefined)
    const cleanedLead = Object.fromEntries(
      Object.entries(lead).filter(([, value]) => value !== undefined)
    )

    await setDoc(
      docRef,
      {
        // Store full lead data
        ...cleanedLead,
        // Update contact fields
        contacted: true,
        contactedDate: serverTimestamp(),
        contactNotes: notes || lead.contactNotes || '',
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error marking lead as contacted:', error)
    throw error
  }
}

/**
 * Mark lead as not interested
 */
export async function markAsNotInterested(
  lead: Lead,
  reason?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'leads', lead.id)

    // Filter out undefined values from lead object (Firestore doesn't allow undefined)
    const cleanedLead = Object.fromEntries(
      Object.entries(lead).filter(([, value]) => value !== undefined)
    )

    await setDoc(
      docRef,
      {
        // Store full lead data
        ...cleanedLead,
        // Update not interested fields
        notInterested: true,
        notInterestedDate: serverTimestamp(),
        rejectionReason: reason || '',
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error marking lead as not interested:', error)
    throw error
  }
}

/**
 * Mark lead as not contacted
 */
export async function markAsUncontacted(placeId: string): Promise<void> {
  try {
    const docRef = doc(db, 'leads', placeId)
    await setDoc(
      docRef,
      {
        contacted: false,
        contactedDate: null,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error marking lead as uncontacted:', error)
    throw error
  }
}

/**
 * Delete a lead document from Firestore
 */
export async function deleteLeadData(placeId: string): Promise<void> {
  try {
    const docRef = doc(db, 'leads', placeId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw error
  }
}

/**
 * Create a manual lead (not from Google Places API)
 * Generates unique ID with format: "manual-{timestamp}-{randomId}"
 */
export async function createManualLead(lead: Omit<Lead, 'id'>): Promise<string> {
  try {
    // Generate unique ID for manual lead
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 11)
    const leadId = `manual-${timestamp}-${randomId}`

    const docRef = doc(db, 'leads', leadId)

    // Filter out undefined values (Firestore doesn't allow undefined)
    const cleanedLead = Object.fromEntries(
      Object.entries(lead).filter(([, value]) => value !== undefined)
    )

    await setDoc(docRef, {
      ...cleanedLead,
      isManual: true, // Mark as manually created
      createdDate: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    })

    return leadId
  } catch (error) {
    console.error('Error creating manual lead:', error)
    throw error
  }
}

/**
 * Get all contacted leads
 */
export async function getContactedLeads(): Promise<Lead[]> {
  try {
    const leadsRef = collection(db, 'leads')
    const q = query(
      leadsRef,
      where('contacted', '==', true),
      orderBy('contactedDate', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Lead))
  } catch (error) {
    console.error('Error fetching contacted leads:', error)
    throw error
  }
}
