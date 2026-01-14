import adminApp from './firebase-admin'
import { Lead } from '@/types/lead'

const adminDb = adminApp.firestore()

/**
 * Get all contacted leads using Firebase Admin SDK
 * Server-side operation for API routes
 *
 * Note: Requires composite Firestore index on:
 * - Collection: leads
 * - Fields: contacted (Ascending) + contactedDate (Descending)
 */
export async function getContactedLeads(): Promise<Lead[]> {
  try {
    const snapshot = await adminDb
      .collection('leads')
      .where('contacted', '==', true)
      .orderBy('contactedDate', 'desc')
      .get()

    return snapshot.docs.map((doc) => {
      const data = doc.data()

      // Convert Firestore Timestamp objects to ISO strings for JSON serialization
      const convertTimestamp = (value: any): any => {
        if (value && typeof value.toDate === 'function') {
          return value.toDate().toISOString()
        }
        return value
      }

      return {
        ...data,
        id: doc.id,
        contactedDate: convertTimestamp(data.contactedDate),
        lastUpdated: convertTimestamp(data.lastUpdated),
      } as unknown as Lead
    })
  } catch (error) {
    console.error('Error fetching contacted leads:', error)
    throw error
  }
}
