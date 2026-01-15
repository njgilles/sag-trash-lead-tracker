'use client'

import { Contract } from '@/types/lead'

interface ContractsTableProps {
  contracts: Contract[]
  loading: boolean
  error: string | null
  onViewDetails?: (contract: Contract) => void
}

export function ContractsTable({
  contracts,
  loading,
  error,
  onViewDetails,
}: ContractsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner h-10 w-10 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-semibold">Error loading contracts</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-lg">No contracts yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Import your first contract using the button above
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Customer Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Address
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Contact Email
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Contact Phone
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Service Type
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Imported Date
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract, index) => (
            <tr
              key={contract.id}
              className={`border-b border-gray-200 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-gray-100 transition`}
            >
              <td className="px-6 py-4 text-gray-900 font-medium">
                {contract.customerName}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {contract.customerAddress1}
                {contract.customerAddress2 && `, ${contract.customerAddress2}`}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {contract.contactEmail || '—'}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {contract.contactPhone || contract.contactMobile || '—'}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {contract.serviceType || '—'}
              </td>
              <td className="px-6 py-4 text-gray-600 text-xs">
                {new Date(contract.importedDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onViewDetails?.(contract)}
                  className="text-cyan-600 hover:text-cyan-700 font-medium transition"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
