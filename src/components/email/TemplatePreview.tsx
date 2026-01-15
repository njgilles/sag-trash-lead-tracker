'use client'

import { FiArrowLeft, FiCopy, FiCheck } from 'react-icons/fi'
import { useState } from 'react'

interface TemplatePreviewProps {
  subject: string
  body: string
  onBack: () => void
}

export function TemplatePreview({ subject, body, onBack }: TemplatePreviewProps) {
  const [copied, setCopied] = useState(false)

  // Sample data for preview
  const sampleData = {
    name: 'ABC Pool Services',
    address: '123 Main Street, Raleigh, NC 27601',
    contactPerson: 'John Smith',
  }

  // Fill placeholders with sample data
  const fillPlaceholders = (text: string) => {
    let filled = text
    filled = filled.replace(/\{\{name\}\}/g, sampleData.name)
    filled = filled.replace(/\{\{address\}\}/g, sampleData.address)
    filled = filled.replace(/\{\{contactPerson\}\}/g, sampleData.contactPerson)
    return filled
  }

  const filledSubject = fillPlaceholders(subject)
  const filledBody = fillPlaceholders(body)
  const emailContent = `Subject: ${filledSubject}\n\n${filledBody}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Template Preview</h2>
      </div>

      {/* Sample Data Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>
          <strong>Sample Data:</strong> {sampleData.name} • {sampleData.address} •{' '}
          {sampleData.contactPerson}
        </p>
      </div>

      {/* Email Preview */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        {/* Subject Line */}
        <div className="bg-gray-50 border-b p-4 border-gray-300">
          <p className="text-sm text-gray-600">From: [Your Name] &lt;your.email@example.com&gt;</p>
          <p className="text-sm text-gray-600">To: John Smith &lt;john@abcpool.com&gt;</p>
          <p className="font-semibold text-gray-900 mt-2">Subject: {filledSubject}</p>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          <div className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
            {filledBody}
          </div>
        </div>
      </div>

      {/* Copy Button */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          {copied ? (
            <>
              <FiCheck className="w-4 h-4" /> Copied!
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4" /> Copy Email
            </>
          )}
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Back to Editing
        </button>
      </div>
    </div>
  )
}
