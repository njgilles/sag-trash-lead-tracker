'use client'

import { Lead } from '@/types/lead'
import { InlineEditField } from './InlineEditField'

interface ContactFieldsProps {
  lead: Lead
  onSave: (data: {
    contactPerson?: string
    email?: string
    contactNotes?: string
  }) => Promise<void>
  onClose?: () => void
  loading?: boolean
}

export function ContactFields({
  lead,
  onSave,
  loading = false,
}: ContactFieldsProps) {
  const handleFieldSave = async (field: string, value: string) => {
    await onSave({
      ...(field === 'contactPerson' && { contactPerson: value || undefined }),
      ...(field === 'email' && { email: value || undefined }),
      ...(field === 'contactNotes' && { contactNotes: value || undefined }),
    })
  }

  return (
    <div className="space-y-5">
      {/* Contact Person Name - Inline Editable */}
      <InlineEditField
        label="Contact Person Name"
        value={lead.contactPerson || ''}
        onSave={(value) => handleFieldSave('contactPerson', value)}
        placeholder="Enter contact person's name"
        type="text"
        disabled={loading}
      />

      {/* Email Address - Inline Editable */}
      <InlineEditField
        label="Email Address"
        value={lead.email || ''}
        onSave={(value) => handleFieldSave('email', value)}
        placeholder="example@company.com"
        type="email"
        disabled={loading}
      />

      {/* Phone (Display Only from Google) */}
      {lead.phone && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Phone (from Google)
          </label>
          <div>
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
          <label className="block text-sm text-gray-600 mb-1">
            Website (from Google)
          </label>
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700 font-medium break-all"
          >
            {lead.website}
          </a>
        </div>
      )}

      {/* Contact Notes - Inline Editable */}
      <InlineEditField
        label="Contact Notes"
        value={lead.contactNotes || ''}
        onSave={(value) => handleFieldSave('contactNotes', value)}
        placeholder="Add notes about this lead..."
        multiline
        rows={3}
        disabled={loading}
      />

      {/* Tip for keyboard shortcuts */}
      <p className="text-xs text-gray-500 italic pt-2">
        💡 Tip: Press Enter to save (Ctrl+Enter for multi-line notes), Esc to cancel
      </p>
    </div>
  )
}
