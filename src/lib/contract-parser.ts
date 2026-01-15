import * as XLSX from 'xlsx'

export interface ContractData {
  // Customer Section (Row 22-25, Column 0-2)
  customerName: string
  customerAddress1: string
  customerAddress2?: string

  // Billing Address Section (Row 23-25, Column 4-6)
  billingAddress1?: string
  billingAddress2?: string

  // Primary Contact Section (Row 23-26, Column 8-10)
  contactEmail?: string
  contactMobile?: string
  contactPhone?: string

  // Site Information (Row 39-42, Column 2-3)
  siteName?: string
  siteAddress1?: string
  siteAddress2?: string
  siteContact?: string

  // Service Details (Row 29-32)
  effectiveDate?: string
  serviceType?: string
}

/**
 * Parse a single contract XLSX/XLS file and extract customer/contact information
 * @param fileBuffer Excel file buffer
 * @returns Parsed contract data
 */
export function parseContractXLSX(fileBuffer: ArrayBuffer): ContractData {
  try {
    // Parse Excel file using xlsx
    const workbook = XLSX.read(fileBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    // Convert worksheet to 2D array of values
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 0, defval: '' }) as Record<number, string>[]

    // Convert back to proper array format (xlsx returns object with numeric keys)
    const arrayRows: string[][] = []
    for (let i = 0; i < 100; i++) {
      const row: string[] = []
      for (let j = 0; j < 20; j++) {
        const cellAddress = XLSX.utils.encode_cell({ r: i, c: j })
        const cell = worksheet[cellAddress]
        row[j] = cell ? String(cell.v || '') : ''
      }
      arrayRows[i] = row
    }

    // Extract data from specific rows/columns based on template structure
    const contractData: ContractData = {
      // Customer info (prioritize over site info if both present)
      // Labels are in col 0, values are in col 1
      customerName: cleanValue(arrayRows[22]?.[1]),
      customerAddress1: cleanValue(arrayRows[23]?.[1]),
      customerAddress2: cleanValue(arrayRows[24]?.[1]),

      // Billing address (fallback if customer address empty)
      // Labels are in col 4, values are in col 5
      billingAddress1: cleanValue(arrayRows[23]?.[5]),
      billingAddress2: cleanValue(arrayRows[24]?.[5]),

      // Primary contact
      // Labels are in col 8, values are in col 9
      contactEmail: cleanValue(arrayRows[23]?.[9]),
      contactMobile: cleanValue(arrayRows[24]?.[9]),
      contactPhone: cleanValue(arrayRows[25]?.[9]),

      // Site information
      // Labels are in col 0/2, values are in col 3
      siteName: cleanValue(arrayRows[39]?.[3]),
      siteAddress1: cleanValue(arrayRows[40]?.[3]),
      siteAddress2: cleanValue(arrayRows[41]?.[3]),
      siteContact: cleanValue(arrayRows[42]?.[3]),

      // Service details
      effectiveDate: cleanValue(arrayRows[29]?.[9]) || cleanValue(arrayRows[29]?.[10]),
      serviceType: cleanValue(arrayRows[32]?.[1]),
    }

    console.log('Excel parsed successfully:', contractData)
    return contractData
  } catch (error) {
    console.error('Error parsing contract XLSX:', error)
    throw new Error(`Failed to parse contract file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Clean and normalize a cell value
 * Removes quotes, extra whitespace, and returns empty string for falsy values
 */
function cleanValue(value: string | undefined): string {
  if (!value) return ''

  // Remove surrounding quotes if present
  let cleaned = String(value).trim()
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1)
  }

  // Normalize whitespace (remove multiple spaces, trim)
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

/**
 * Validate that a contract has minimum required fields
 */
export function validateContractData(contract: ContractData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for customer name (required)
  if (!contract.customerName) {
    errors.push('Customer name is required')
  }

  // Check for address (at least one address field should be populated)
  const hasCustomerAddress = contract.customerAddress1 || contract.customerAddress2
  const hasBillingAddress = contract.billingAddress1 || contract.billingAddress2
  const hasSiteAddress = contract.siteAddress1 || contract.siteAddress2

  if (!hasCustomerAddress && !hasBillingAddress && !hasSiteAddress) {
    errors.push('At least one address is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Parse multiple contract Excel files
 * @param files Array of File objects from file input
 * @returns Promise resolving to array of parsed contracts
 */
export async function parseMultipleContractXLSX(files: File[]): Promise<ContractData[]> {
  const contracts: ContractData[] = []

  for (const file of files) {
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const contract = parseContractXLSX(buffer)
      contracts.push(contract)
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error)
      throw new Error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return contracts
}

/**
 * Read a File object as ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (content instanceof ArrayBuffer) {
        resolve(content)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`))
    }
    reader.readAsArrayBuffer(file)
  })
}
