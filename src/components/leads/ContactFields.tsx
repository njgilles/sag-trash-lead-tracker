'use client'

import { useState } from 'react'
import { Lead } from '@/types/lead'

interface ContactFieldsProps {
  lead: Lead
  onSave: (data: {
    contactPerson?: string
    email?: string
    contactNotes?: string
  }) => void
  onCancel: () => void
  loading?: boolean
}

export function ContactFields({
  lead,
  onSave,
  onCancel,
  loading,
}: ContactFieldsProps) {
  const [contactPerson, setContactPerson] = useState(lead.contactPerson || '')
  const [email, setEmail] = useState(lead.email || '')
  const [contactNotes, setContactNotes] = useState(lead.contactNotes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      contactPerson: contactPerson || undefined,
      email: email || undefined,
      contactNotes: contactNotes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Contact Person Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Person Name
        </label>
        <input
          type="text"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          placeholder="Enter contact person's name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={loading}
        />
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@company.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={loading}
        />
      </div>

      {/* Phone (Display Only from Google) */}
      {lead.phone && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (from Google)
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
            <a
              href={`tel:${lead.phone}`}
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              {lead.phone}
            </a>
          </div>
        </div>
      )}

      {/* Website (Display Only from Google) */}
      {lead.website && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website (from Google)
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-700 font-medium break-all"
            >
              {lead.website}
            </a>
          </div>
        </div>
      )}

      {/* Contact Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Notes
        </label>
        <textarea
          value={contactNotes}
          onChange={(e) => setContactNotes(e.target.value)}
          placeholder="Add notes about this lead..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
