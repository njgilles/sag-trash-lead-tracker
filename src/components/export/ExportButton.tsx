'use client'

import { useState } from 'react'
import { Lead } from '@/types/lead'
import { downloadCSV } from '@/lib/csv-export'

interface ExportButtonProps {
  leads: Lead[]
}

export function ExportButton({ leads }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (leads.length === 0) return

    setIsExporting(true)
    try {
      downloadCSV(leads)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export leads')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={leads.length === 0 || isExporting}
      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm"
    >
      {isExporting ? 'Exporting...' : `Export (${leads.length})`}
    </button>
  )
}
