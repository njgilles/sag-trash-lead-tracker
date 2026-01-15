'use client'

import { useState } from 'react'
import { ContractData, validateContractData } from '@/lib/contract-parser'
import { contractToLeadData } from '@/lib/batch-contract-import'

interface ContractPreviewTableProps {
  contracts: ContractData[]
  onConfirm: (contracts: ContractData[]) => void
  onBack: () => void
  loading: boolean
}

export function ContractPreviewTable({
  contracts: initialContracts,
  onConfirm,
  onBack,
  loading,
}: ContractPreviewTableProps) {
  const [contracts, setContracts] = useState(initialContracts)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editField, setEditField] = useState<string | null>(null)

  const handleRemoveContract = (index: number) => {
    setContracts(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditField = (
    index: number,
    field: keyof ContractData,
    value: string
  ) => {
    setContracts(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value || undefined,
      }
      return updated
    })
  }

  const handleConfirm = () => {
    // Filter out invalid contracts
    const validContracts = contracts.filter(c => {
      const validation = validateContractData(c)
      return validation.valid
    })

    if (validContracts.length === 0) {
      alert('No valid contracts to import. Please fix validation errors.')
      return
    }

    onConfirm(validContracts)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p className="mb-2">
          Review the parsed contract data below. You can edit individual fields before importing.
        </p>
        <p className="text-xs">
          <span className="text-red-600">✓ Valid</span>
          {' - '}
          <span className="text-yellow-600">⚠ Missing required fields</span>
        </p>
      </div>

      {/* Contracts Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Customer Name</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Address</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contracts.map((contract, index) => {
              const validation = validateContractData(contract)
              const address = contract.customerAddress1 || contract.billingAddress1 || contract.siteAddress1 || '(No address)'

              return (
                <tr
                  key={index}
                  className={validation.valid ? 'bg-white hover:bg-gray-50' : 'bg-yellow-50 hover:bg-yellow-100'}
                >
                  <td className="px-4 py-2 text-center">
                    {validation.valid ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span
                        className="text-yellow-600 font-bold cursor-help"
                        title={validation.errors.join('\n')}
                      >
                        ⚠
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    <button
                      onClick={() => {
                        setEditingIndex(index)
                        setEditField('customerName')
                      }}
                      className="text-cyan-600 hover:underline text-left"
                    >
                      {contract.customerName || '(Click to edit)'}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-gray-700 text-xs">
                    <button
                      onClick={() => {
                        setEditingIndex(index)
                        setEditField('customerAddress1')
                      }}
                      className="text-cyan-600 hover:underline text-left"
                    >
                      {address}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-gray-700 text-xs">
                    {contract.siteContact || contract.contactMobile || contract.contactPhone || '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 text-xs">
                    {contract.contactEmail || '-'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleRemoveContract(index)}
                      className="text-red-600 hover:text-red-700 font-medium text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && editField !== null && (
        <EditFieldModal
          contract={contracts[editingIndex]}
          field={editField as keyof ContractData}
          value={contracts[editingIndex][editField as keyof ContractData] as string || ''}
          onSave={(newValue) => {
            handleEditField(editingIndex, editField as keyof ContractData, newValue)
            setEditingIndex(null)
            setEditField(null)
          }}
          onCancel={() => {
            setEditingIndex(null)
            setEditField(null)
          }}
        />
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="text-blue-900">
          <span className="font-semibold">{contracts.filter(c => validateContractData(c).valid).length}</span>
          {' of '}
          <span className="font-semibold">{contracts.length}</span>
          {' contracts are ready to import'}
        </p>
      </div>
    </div>
  )
}

interface EditFieldModalProps {
  contract: ContractData
  field: keyof ContractData
  value: string
  onSave: (value: string) => void
  onCancel: () => void
}

function EditFieldModal({
  contract,
  field,
  value,
  onSave,
  onCancel,
}: EditFieldModalProps) {
  const [inputValue, setInputValue] = useState(value)

  const fieldLabels: Record<keyof ContractData, string> = {
    customerName: 'Customer Name',
    customerAddress1: 'Customer Address 1',
    customerAddress2: 'Customer Address 2',
    billingAddress1: 'Billing Address 1',
    billingAddress2: 'Billing Address 2',
    contactEmail: 'Contact Email',
    contactMobile: 'Contact Mobile',
    contactPhone: 'Contact Phone',
    siteName: 'Site Name',
    siteAddress1: 'Site Address 1',
    siteAddress2: 'Site Address 2',
    siteContact: 'Site Contact',
    effectiveDate: 'Effective Date',
    serviceType: 'Service Type',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Edit: {fieldLabels[field]}
        </h3>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          placeholder="Enter value"
        />
        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(inputValue)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-medium transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
