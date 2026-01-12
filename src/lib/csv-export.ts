import { Lead } from '@/types/lead'

export function generateCSV(leads: Lead[]): string {
  const headers = [
    'Name',
    'Address',
    'Type',
    'Contact Person',
    'Phone',
    'Email',
    'Website',
    'Rating',
    'Distance (mi)',
    'Contacted',
    'Contact Date',
    'Contact Notes',
    'Notes',
  ]

  const rows = leads.map(lead => [
    escapeCSVValue(lead.name),
    escapeCSVValue(lead.address),
    lead.type,
    escapeCSVValue(lead.contactPerson || ''),
    escapeCSVValue(lead.phone || ''),
    escapeCSVValue(lead.email || ''),
    escapeCSVValue(lead.website || ''),
    lead.rating?.toString() || '',
    lead.distance?.toString() || '',
    lead.contacted ? 'Yes' : 'No',
    lead.contactedDate
      ? new Date(lead.contactedDate).toLocaleDateString()
      : '',
    escapeCSVValue(lead.contactNotes || ''),
    escapeCSVValue(lead.notes || ''),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}

function escapeCSVValue(value: string): string {
  if (!value) return ''

  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export function downloadCSV(leads: Lead[]): void {
  const csv = generateCSV(leads)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().split('T')[0]
  link.setAttribute('href', url)
  link.setAttribute('download', `sag-leads-${timestamp}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
