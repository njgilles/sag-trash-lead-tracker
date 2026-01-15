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
import { Lead, Contract, EmailTemplateDocument } from '@/types/lead'

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

/**
 * Store a contract in the contracts collection
 */
export async function createContract(
  contractData: Omit<Contract, 'id'>
): Promise<string> {
  try {
    // Generate a unique ID for the contract
    const contractId = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const docRef = doc(db, 'contracts', contractId)
    await setDoc(docRef, {
      ...contractData,
      importedDate: new Date().toISOString(),
    })

    console.log('Contract stored:', contractId)
    return contractId
  } catch (error) {
    console.error('Error storing contract:', error)
    throw error
  }
}

/**
 * Get a contract by ID
 */
export async function getContract(contractId: string): Promise<Contract | null> {
  try {
    const docRef = doc(db, 'contracts', contractId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Contract
    }
    return null
  } catch (error) {
    console.error('Error fetching contract:', error)
    throw error
  }
}

/**
 * Fetch all contracts
 */
export async function getAllContracts(): Promise<Contract[]> {
  try {
    const q = query(
      collection(db, 'contracts'),
      orderBy('importedDate', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Contract))
  } catch (error) {
    console.error('Error fetching contracts:', error)
    throw error
  }
}

/**
 * Update a contract
 */
export async function updateContract(
  contractId: string,
  data: Partial<Contract>
): Promise<void> {
  try {
    const docRef = doc(db, 'contracts', contractId)
    // Filter out undefined values
    const updateData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>
    )
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating contract:', error)
    throw error
  }
}

/**
 * Delete a contract
 */
export async function deleteContract(contractId: string): Promise<void> {
  try {
    const docRef = doc(db, 'contracts', contractId)
    await deleteDoc(docRef)
    console.log('Contract deleted:', contractId)
  } catch (error) {
    console.error('Error deleting contract:', error)
    throw error
  }
}

/**
 * Get all active email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplateDocument[]> {
  try {
    const templatesRef = collection(db, 'email_templates')
    const q = query(
      templatesRef,
      where('isActive', '==', true),
      orderBy('createdDate', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as EmailTemplateDocument))
  } catch (error) {
    console.error('Error fetching email templates:', error)
    throw error
  }
}

/**
 * Get a single email template by ID
 */
export async function getEmailTemplate(templateId: string): Promise<EmailTemplateDocument | null> {
  try {
    const docRef = doc(db, 'email_templates', templateId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as EmailTemplateDocument
    }
    return null
  } catch (error) {
    console.error('Error fetching email template:', error)
    throw error
  }
}

/**
 * Create a new email template
 */
export async function createEmailTemplate(
  template: Omit<EmailTemplateDocument, 'id' | 'createdDate' | 'lastUpdated'>
): Promise<string> {
  try {
    // Generate unique ID for template
    const templateId = `template-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const docRef = doc(db, 'email_templates', templateId)

    await setDoc(docRef, {
      ...template,
      createdDate: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    })

    return templateId
  } catch (error) {
    console.error('Error creating email template:', error)
    throw error
  }
}

/**
 * Update an existing email template
 */
export async function updateEmailTemplate(
  templateId: string,
  updates: Partial<EmailTemplateDocument>
): Promise<void> {
  try {
    const docRef = doc(db, 'email_templates', templateId)

    // Filter out undefined values and remove id field
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates)
        .filter(([key, value]) => value !== undefined && key !== 'id')
    )

    await updateDoc(docRef, {
      ...cleanedUpdates,
      lastUpdated: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating email template:', error)
    throw error
  }
}

/**
 * Delete a template (soft delete by setting isActive: false)
 * System templates cannot be deleted
 */
export async function deleteEmailTemplate(templateId: string): Promise<void> {
  try {
    // Fetch template to check if it's a system template
    const template = await getEmailTemplate(templateId)

    if (!template) {
      throw new Error('Template not found')
    }

    if (template.isSystem) {
      throw new Error('Cannot delete system templates')
    }

    // Soft delete: set isActive to false
    const docRef = doc(db, 'email_templates', templateId)
    await updateDoc(docRef, {
      isActive: false,
      lastUpdated: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error deleting email template:', error)
    throw error
  }
}
