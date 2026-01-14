'use client'

import { useState } from 'react'
import { Lead } from '@/types/lead'
import { ContactFields } from './ContactFields'

interface LeadDetailsModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onMarkContacted?: (notes?: string) => void
  onMarkNotInterested?: (reason?: string) => void
  onUpdateContactInfo?: (
    placeId: string,
    data: {
      contactPerson?: string
      email?: string
      contactNotes?: string
    }
  ) => Promise<void>
  onDelete?: () => Promise<void>
  loading?: boolean
}

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onMarkContacted,
  onMarkNotInterested,
  onUpdateContactInfo,
  onDelete,
  loading,
}: LeadDetailsModalProps) {
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Guard clause - don't render if modal is closed or lead is null
  if (!isOpen || !lead) return null

  const handleContactSave = async (data: {
    contactPerson?: string
    email?: string
    contactNotes?: string
  }) => {
    if (onUpdateContactInfo) {
      await onUpdateContactInfo(lead.id, data)
    }
  }

  const handleMarkContacted = async () => {
    if (onMarkContacted) {
      onMarkContacted(lead.contactNotes)
    }
  }

  const handleMarkNotInterestedClick = () => {
    setShowReasonModal(true)
  }

  const handleSubmitReason = async () => {
    if (onMarkNotInterested) {
      await onMarkNotInterested(rejectionReason || undefined)
      setShowReasonModal(false)
      setRejectionReason('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[997] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{lead.name}</h2>
            <p className="text-cyan-100 text-sm mt-1">{lead.address}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lead Type Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
              {lead.type.charAt(0).toUpperCase() + lead.type.slice(1)}
            </span>
            {lead.rating && (
              <span className="text-sm text-gray-600">
                ⭐ {lead.rating.toFixed(1)}
                {lead.reviewCount && ` (${lead.reviewCount} reviews)`}
              </span>
            )}
            {lead.distance && (
              <span className="text-sm text-gray-600">
                📍 {lead.distance} miles
              </span>
            )}
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Information
            </h3>

            <ContactFields
              lead={lead}
              onSave={handleContactSave}
              loading={loading}
            />
          </div>

          {/* Contacted Status */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Status
            </h3>

            {lead.contacted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-semibold">
                  ✓ Contacted on{' '}
                  {lead.contactedDate
                    ? new Date(lead.contactedDate).toLocaleDateString()
                    : 'Unknown date'}
                </p>
                {lead.contactNotes && (
                  <p className="text-green-600 mt-2">{lead.contactNotes}</p>
                )}
              </div>
            ) : lead.notInterested ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-semibold">
                  ✕ Not Interested on{' '}
                  {lead.notInterestedDate
                    ? new Date(lead.notInterestedDate).toLocaleDateString()
                    : 'Unknown date'}
                </p>
                {lead.rejectionReason && (
                  <p className="text-red-600 mt-2">Reason: {lead.rejectionReason}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleMarkContacted}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? 'Marking...' : 'Mark as Contacted'}
                </button>
                <button
                  onClick={handleMarkNotInterestedClick}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? 'Marking...' : 'Mark as Not Interested'}
                </button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {lead.notes && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h3>
              <p className="text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between items-center">
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition text-sm"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[998] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 p-4">
              <h3 className="text-lg font-semibold text-red-900">
                Reason for Not Interested
              </h3>
              <p className="text-sm text-red-700 mt-1">
                (Optional) Why did you decide not to pursue this lead?
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Already has service provider, Not a good fit, No contact info, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
              />
            </div>
            <div className="bg-gray-50 border-t p-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReasonModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReason}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
