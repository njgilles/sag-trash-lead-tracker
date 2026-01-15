import { Lead, LeadType, Location, Contract } from '@/types/lead'
import { createManualLead, markAsContacted, createContract } from './firestore-service'
import { ContractData } from './contract-parser'

export interface ImportProgress {
  processed: number
  total: number
  currentFile: string
  status: 'processing' | 'completed' | 'error'
}

export interface ImportResult {
  success: boolean
  importedCount: number
  failedCount: number
  errors: Array<{
    file: string
    error: string
  }>
}

/**
 * Convert contract data to Lead object
 */
export function contractToLeadData(contract: ContractData): Omit<Lead, 'id' | 'location'> & { address: string } {
  return contractToLead(contract)
}

function contractToLead(contract: ContractData): Omit<Lead, 'id' | 'location'> & { address: string } {
  // Determine name (prefer customer name, fallback to site name)
  const name = contract.customerName || contract.siteName || 'Unknown Customer'

  // Determine address (prefer customer, fallback to billing, then site)
  let address = ''
  if (contract.customerAddress1) {
    address = contract.customerAddress1
    if (contract.customerAddress2) {
      address += ', ' + contract.customerAddress2
    }
  } else if (contract.billingAddress1) {
    address = contract.billingAddress1
    if (contract.billingAddress2) {
      address += ', ' + contract.billingAddress2
    }
  } else if (contract.siteAddress1) {
    address = contract.siteAddress1
    if (contract.siteAddress2) {
      address += ', ' + contract.siteAddress2
    }
  }

  console.log('Contract data extracted:', {
    name,
    address,
    customerName: contract.customerName,
    customerAddress1: contract.customerAddress1,
    customerAddress2: contract.customerAddress2,
    billingAddress1: contract.billingAddress1,
    siteAddress1: contract.siteAddress1,
  })

  // Determine phone (prefer mobile, fallback to phone)
  const phone = contract.contactMobile || contract.contactPhone || undefined

  // Determine lead type based on service type (default to 'pool' for trash services)
  let type: LeadType = 'pool'
  if (contract.serviceType && contract.serviceType.toLowerCase().includes('hoa')) {
    type = 'hoa'
  } else if (contract.serviceType && contract.serviceType.toLowerCase().includes('neighborhood')) {
    type = 'neighborhood'
  }

  // Parse effective date to ISO string if present
  const contactedDate = contract.effectiveDate ? parseDate(contract.effectiveDate) : undefined

  return {
    name,
    address,
    type,
    phone,
    email: contract.contactEmail || undefined,
    contactPerson: contract.siteContact || undefined,
    notes: contract.serviceType ? `Service: ${contract.serviceType}` : undefined,
    contactedDate,
  }
}

/**
 * Parse date string in various formats to ISO string
 */
function parseDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined

  try {
    // Try parsing as ISO date
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr)
  }

  return undefined
}

/**
 * Geocode an address using the /api/geocode endpoint
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    if (!address) {
      throw new Error('Address is empty or invalid')
    }

    console.log(`Geocoding address: "${address}"`)

    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Geocoding API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (data.success && data.location) {
      return data.location
    }

    throw new Error(`No location found for address: ${address}`)
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}

/**
 * Process contracts with rate limiting for geocoding
 * Geocode addresses and create leads in Firestore
 */
export async function importContractsToLeads(
  contracts: ContractData[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    importedCount: 0,
    failedCount: 0,
    errors: [],
  }

  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i]
    const fileNumber = i + 1

    try {
      // Report progress
      onProgress?.({
        processed: i,
        total: contracts.length,
        currentFile: `Contract ${fileNumber}/${contracts.length}`,
        status: 'processing',
      })

      // Convert contract to lead
      const leadData = contractToLead(contract)

      // Geocode the address
      const location = await geocodeAddress(leadData.address)
      if (!location) {
        throw new Error(`Could not geocode address: ${leadData.address}`)
      }

      // Create lead in Firestore
      const leadId = await createManualLead({
        ...leadData,
        location,
        isManual: true, // Mark as manually imported from contract
      })

      // Automatically mark as contacted (these are existing customers)
      const fullLead: Lead = {
        id: leadId,
        ...leadData,
        location,
        isManual: true,
      }

      await markAsContacted(fullLead, `Imported from contract on ${new Date().toLocaleDateString()}`)

      // Store the full contract data in Firestore
      const contractRecord: Omit<Contract, 'id'> = {
        customerName: contract.customerName || '',
        customerAddress1: contract.customerAddress1 || '',
        customerAddress2: contract.customerAddress2,
        billingAddress1: contract.billingAddress1,
        billingAddress2: contract.billingAddress2,
        contactEmail: contract.contactEmail,
        contactMobile: contract.contactMobile,
        contactPhone: contract.contactPhone,
        siteName: contract.siteName,
        siteAddress1: contract.siteAddress1,
        siteAddress2: contract.siteAddress2,
        siteContact: contract.siteContact,
        effectiveDate: contract.effectiveDate,
        serviceType: contract.serviceType,
        location: location as Location,
        linkedLeadId: leadId, // Link contract to the created lead
        importedDate: new Date().toISOString(),
      }

      await createContract(contractRecord)

      result.importedCount++
    } catch (error) {
      result.failedCount++
      result.success = false
      result.errors.push({
        file: `Contract ${fileNumber}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      console.error(`Error importing contract ${fileNumber}:`, error)
    }
  }

  // Report completion
  onProgress?.({
    processed: contracts.length,
    total: contracts.length,
    currentFile: 'Complete',
    status: result.success ? 'completed' : 'error',
  })

  return result
}
