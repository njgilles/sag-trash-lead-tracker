'use client'

import { useState } from 'react'
import { Lead } from '@/types/lead'
import { ContactFields } from './ContactFields'

interface LeadDetailsModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onMarkContacted?: (notes?: string) => void
  onUpdateContactInfo?: (
    placeId: string,
    data: {
      contactPerson?: string
      email?: string
      contactNotes?: string
    }
  ) => Promise<void>
  loading?: boolean
}

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onMarkContacted,
  onUpdateContactInfo,
  loading,
}: LeadDetailsModalProps) {
  const [showContactForm, setShowContactForm] = useState(false)

  // Guard clause - don't render if modal is closed or lead is null
  if (!isOpen || !lead) return null

  const handleContactSave = async (data: {
    contactPerson?: string
    email?: string
    contactNotes?: string
  }) => {
    if (onUpdateContactInfo) {
      await onUpdateContactInfo(lead.id, data)
      setShowContactForm(false)
    }
  }

  const handleMarkContacted = async () => {
    if (onMarkContacted) {
      onMarkContacted(lead.contactNotes)
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

            {showContactForm ? (
              <ContactFields
                lead={lead}
                onSave={handleContactSave}
                onCancel={() => setShowContactForm(false)}
                loading={loading}
              />
            ) : (
              <div className="space-y-3">
                {lead.contactPerson && (
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium text-gray-900">
                      {lead.contactPerson}
                    </p>
                  </div>
                )}

                {lead.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${lead.phone}`}
                      className="font-medium text-cyan-600 hover:text-cyan-700"
                    >
                      {lead.phone}
                    </a>
                  </div>
                )}

                {lead.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-medium text-cyan-600 hover:text-cyan-700 break-all"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}

                {lead.website && (
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-cyan-600 hover:text-cyan-700 break-all"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}

                {!lead.contactPerson &&
                  !lead.email &&
                  !lead.phone &&
                  !lead.website && (
                    <p className="text-gray-500 italic">
                      No contact information available
                    </p>
                  )}

                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full mt-4 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 font-medium transition"
                >
                  Edit Contact Information
                </button>
              </div>
            )}
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
            ) : (
              <button
                onClick={handleMarkContacted}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? 'Marking...' : 'Mark as Contacted'}
              </button>
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
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
