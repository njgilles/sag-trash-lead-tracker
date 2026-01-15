'use client'

import { Contract } from '@/types/lead'

interface ContractDetailsModalProps {
  contract: Contract | null
  isOpen: boolean
  onClose: () => void
}

export function ContractDetailsModal({
  contract,
  isOpen,
  onClose,
}: ContractDetailsModalProps) {
  if (!isOpen || !contract) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-border" style={{ backgroundColor: '#0f1e2e' }}>
        {/* Header */}
        <div className="border-b border-dark-border p-6 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: '#1a2a3a' }}>
          <div>
            <h2 className="text-2xl font-bold text-white">Contract Details</h2>
            <p className="text-dark-50 text-sm mt-1">{contract.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dark-50 hover:text-white transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Customer Name
                </p>
                <p className="text-white mt-1">{contract.customerName || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Customer Address 1
                </p>
                <p className="text-white mt-1">{contract.customerAddress1 || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Customer Address 2
                </p>
                <p className="text-white mt-1">{contract.customerAddress2 || '—'}</p>
              </div>
            </div>
          </section>

          {/* Billing Address */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
              Billing Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Billing Address 1
                </p>
                <p className="text-white mt-1">{contract.billingAddress1 || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Billing Address 2
                </p>
                <p className="text-white mt-1">{contract.billingAddress2 || '—'}</p>
              </div>
            </div>
          </section>

          {/* Primary Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
              Primary Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Email
                </p>
                <p className="text-white mt-1 break-all">
                  {contract.contactEmail ? (
                    <a
                      href={`mailto:${contract.contactEmail}`}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {contract.contactEmail}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Mobile
                </p>
                <p className="text-white mt-1">
                  {contract.contactMobile ? (
                    <a
                      href={`tel:${contract.contactMobile}`}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {contract.contactMobile}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Phone
                </p>
                <p className="text-white mt-1">
                  {contract.contactPhone ? (
                    <a
                      href={`tel:${contract.contactPhone}`}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {contract.contactPhone}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Site Information */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
              Site Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Site Name
                </p>
                <p className="text-white mt-1">{contract.siteName || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Site Contact
                </p>
                <p className="text-white mt-1">{contract.siteContact || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Site Address 1
                </p>
                <p className="text-white mt-1">{contract.siteAddress1 || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Site Address 2
                </p>
                <p className="text-white mt-1">{contract.siteAddress2 || '—'}</p>
              </div>
            </div>
          </section>

          {/* Service Details */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Service Type
                </p>
                <p className="text-white mt-1">{contract.serviceType || '—'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Effective Date
                </p>
                <p className="text-white mt-1">
                  {contract.effectiveDate
                    ? new Date(contract.effectiveDate).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Imported Date
                </p>
                <p className="text-white mt-1">
                  {new Date(contract.importedDate).toLocaleDateString()} at{' '}
                  {new Date(contract.importedDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </section>

          {/* Location */}
          {contract.location && (
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
                Location
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-dark-100 text-xs font-semibold uppercase">
                    Latitude
                  </p>
                  <p className="text-white mt-1 font-mono text-sm">
                    {contract.location.lat.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-dark-100 text-xs font-semibold uppercase">
                    Longitude
                  </p>
                  <p className="text-white mt-1 font-mono text-sm">
                    {contract.location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Linked Lead */}
          {contract.linkedLeadId && (
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
                Linked Lead
              </h3>
              <div>
                <p className="text-dark-100 text-xs font-semibold uppercase">
                  Lead ID
                </p>
                <p className="text-white mt-1 font-mono text-sm">
                  {contract.linkedLeadId}
                </p>
              </div>
            </section>
          )}

          {/* Notes */}
          {contract.notes && (
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-dark-border">
                Notes
              </h3>
              <p className="text-dark-50 whitespace-pre-wrap">{contract.notes}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-dark-700 border-t border-dark-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-500 text-white rounded-lg hover:bg-dark-600 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
