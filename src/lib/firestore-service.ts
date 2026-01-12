import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

    if (existingDoc.exists()) {
      // Document exists, update it
      await updateDoc(docRef, {
        ...data,
        lastUpdated: serverTimestamp(),
      })
    } else {
      // Document doesn't exist, create it
      await setDoc(docRef, {
        ...data,
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
    await setDoc(
      docRef,
      {
        // Store full lead data
        ...lead,
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
 * Delete all lead metadata (nuclear option)
 */
export async function deleteLeadData(placeId: string): Promise<void> {
  try {
    const docRef = doc(db, 'leads', placeId)
    await setDoc(docRef, {}, { merge: false })
  } catch (error) {
    console.error('Error deleting lead data:', error)
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
