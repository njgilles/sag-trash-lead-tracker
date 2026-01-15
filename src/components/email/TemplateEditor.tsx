'use client'

import { useState, useEffect } from 'react'
import { EmailTemplateDocument } from '@/types/lead'
import { FiArrowLeft } from 'react-icons/fi'
import { TemplatePreview } from './TemplatePreview'

const LEAD_TYPES = ['pool', 'hoa', 'neighborhood', 'other'] as const

interface TemplateEditorProps {
  template?: EmailTemplateDocument
  onSave: (template: Omit<EmailTemplateDocument, 'id' | 'createdDate' | 'lastUpdated'>) => Promise<void>
  onCancel: () => void
  isSaving?: boolean
}

export function TemplateEditor({
  template,
  onSave,
  onCancel,
  isSaving = false,
}: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    subject: template?.subject || '',
    body: template?.body || '',
    leadTypes: template?.leadTypes || [],
    recommended: template?.recommended || false,
    isSystem: template?.isSystem || false,
    isActive: template?.isActive !== false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!formData.body.trim()) {
      newErrors.body = 'Body is required'
    }
    if (formData.leadTypes.length === 0) {
      newErrors.leadTypes = 'Select at least one lead type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSave({
        ...formData,
        isSystem: formData.isSystem,
        isActive: formData.isActive,
      })
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const toggleLeadType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      leadTypes: prev.leadTypes.includes(type as any)
        ? prev.leadTypes.filter((t) => t !== type)
        : [...prev.leadTypes, type as any],
    }))
  }

  const getLeadTypeColor = (leadType: string) => {
    const colors: Record<string, string> = {
      pool: 'border-red-300 bg-red-50 text-red-700 checked:bg-red-600 checked:border-red-600',
      hoa: 'border-blue-300 bg-blue-50 text-blue-700 checked:bg-blue-600 checked:border-blue-600',
      neighborhood:
        'border-green-300 bg-green-50 text-green-700 checked:bg-green-600 checked:border-green-600',
      other: 'border-purple-300 bg-purple-50 text-purple-700 checked:bg-purple-600 checked:border-purple-600',
    }
    return colors[leadType] || colors.other
  }

  if (showPreview) {
    return (
      <TemplatePreview
        subject={formData.subject}
        body={formData.body}
        onBack={() => setShowPreview(false)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>
      </div>

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Template Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }))
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
          }}
          placeholder="e.g., Initial Outreach"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSaving}
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Description *
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, description: e.target.value }))
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }))
          }}
          placeholder="What is this template for?"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSaving}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Email Subject *
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
            if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }))
          }}
          placeholder="e.g., Professional Pool Services for {{name}}"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            errors.subject ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSaving}
        />
        <p className="text-gray-600 text-xs mt-1">
          Placeholders: {'{'}{'{'
        }name{'}'}
        {'}'},  {'{'}{'{'
        }address{'}'}
        {'}'} {'}'}, {'{'}{'{'
        }contactPerson{'}'}
        {'}'}
        {'}'}
        </p>
        {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
      </div>

      {/* Body Field */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Email Body *
        </label>
        <textarea
          value={formData.body}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, body: e.target.value }))
            if (errors.body) setErrors((prev) => ({ ...prev, body: '' }))
          }}
          placeholder="Compose your email message..."
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            errors.body ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSaving}
        />
        <p className="text-gray-600 text-xs mt-1">
          Placeholders: {'{'}{'{'
        }name{'}'}
        {'}'},  {'{'}{'{'
        }address{'}'}
        {'}'} {'}'}, {'{'}{'{'
        }contactPerson{'}'}
        {'}'}
        {'}'}
        </p>
        {errors.body && <p className="text-red-600 text-sm mt-1">{errors.body}</p>}
      </div>

      {/* Lead Types */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Applicable Lead Types *
        </label>
        <div className="space-y-2">
          {LEAD_TYPES.map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.leadTypes.includes(type)}
                onChange={() => {
                  toggleLeadType(type)
                  if (errors.leadTypes) setErrors((prev) => ({ ...prev, leadTypes: '' }))
                }}
                className="w-4 h-4 rounded border-2 cursor-pointer"
                disabled={isSaving}
              />
              <span className="ml-3 text-sm capitalize text-gray-700">{type}</span>
            </label>
          ))}
        </div>
        {errors.leadTypes && <p className="text-red-600 text-sm mt-2">{errors.leadTypes}</p>}
      </div>

      {/* Recommended Checkbox */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.recommended}
            onChange={(e) => setFormData((prev) => ({ ...prev, recommended: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"
            disabled={isSaving}
          />
          <span className="text-sm text-gray-700">
            Recommended for selected lead types (shows first in picker)
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition"
          disabled={isSaving}
        >
          Preview
        </button>
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : template ? 'Save Changes' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}
