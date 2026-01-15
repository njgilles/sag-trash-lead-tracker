'use client'

import { useState, useEffect } from 'react'
import { Lead } from '@/types/lead'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import {
  fillTemplate,
  copyToClipboard,
} from '@/lib/email-templates'

interface EmailModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export function EmailModal({ lead, isOpen, onClose }: EmailModalProps) {
  const { templates, loading } = useEmailTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [copied, setCopied] = useState(false)

  // Set initial template when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [templates, selectedTemplateId])

  // Update content when template changes
  useEffect(() => {
    if (!lead || !selectedTemplateId) return

    const template = templates.find((t) => t.id === selectedTemplateId)
    if (template) {
      const filled = fillTemplate(template as any, lead)
      setSubject(filled.subject)
      setBody(filled.body)
    }
  }, [selectedTemplateId, lead, templates])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  if (!isOpen || !lead) return null

  // Get templates for lead type
  const getTemplatesForLeadType = () => {
    const recommended = templates.filter(
      (t) => t.leadTypes.includes(lead.type) && t.recommended
    )
    const other = templates.filter(
      (t) => t.leadTypes.includes(lead.type) && !t.recommended
    )
    return { recommended, other }
  }

  const handleCopyToClipboard = async () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`
    const success = await copyToClipboard(fullEmail)
    if (success) {
      setCopied(true)
    }
  }

  const templatesForLeadType = getTemplatesForLeadType()

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="rounded-lg shadow-xl w-full max-h-[90vh] sm:max-w-2xl max-w-full overflow-hidden flex flex-col" style={{ backgroundColor: '#0f1e2e' }}>
        {/* Header */}
        <div className="border-b border-dark-border p-6 flex justify-between items-start sticky top-0 z-10" style={{ backgroundColor: '#1a2a3a' }}>
          <div>
            <h2 className="text-xl font-bold text-white">Send Email</h2>
            <p className="text-sm text-dark-50 mt-1">{lead.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dark-50 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          ) : (
            <>
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                {lead && (
                  <div className="mb-2 text-xs text-gray-600">
                    <span className="font-medium">Lead Type:</span>{' '}
                    <span className="capitalize">{lead.type}</span>
                  </div>
                )}
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {templatesForLeadType.recommended.length > 0 && (
                    <optgroup label="Recommended for this lead type">
                      {templatesForLeadType.recommended.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {templatesForLeadType.other.length > 0 && (
                    <optgroup label="Other options for this lead type">
                      {templatesForLeadType.other.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Click "Copy to Clipboard" to copy the
                  email content. Paste it into your email client and send!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition"
          >
            Close
          </button>
          <button
            onClick={handleCopyToClipboard}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}
