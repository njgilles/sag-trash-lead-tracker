'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useContracts } from '@/hooks/useContracts'
import { ContractsTable } from '@/components/contracts/ContractsTable'
import { ImportContractsModal } from '@/components/contracts/ImportContractsModal'
import { ContractDetailsModal } from '@/components/contracts/ContractDetailsModal'
import { Contract } from '@/types/lead'

export default function ContractsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { contracts, loading, error, refetch } = useContracts()
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const handleViewDetails = (contract: Contract) => {
    console.log('View contract details:', contract)
    setSelectedContract(contract)
    setIsDetailsModalOpen(true)
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="spinner h-10 w-10 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your customer contracts
          </p>
        </div>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition text-sm flex items-center gap-2 flex-shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Contracts
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <ContractsTable
          contracts={contracts}
          loading={loading}
          error={error}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Contract Details Modal */}
      <ContractDetailsModal
        contract={selectedContract}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedContract(null)
        }}
      />

      {/* Import Modal */}
      <ImportContractsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          refetch()
          setIsImportModalOpen(false)
        }}
      />
    </div>
  )
}
