'use client'

import { useState } from 'react'
import { Lead, LeadType, Location } from '@/types/lead'
import { createManualLead } from '@/lib/firestore-service'

interface ManualLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onLeadCreated: (lead: Lead) => void
  searchCenter?: Location
}

export function ManualLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
  searchCenter,
}: ManualLeadModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'other' as LeadType,
    phone: '',
    website: '',
    contactPerson: '',
    email: '',
    notes: '',
  })

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Business Name is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Geocode the address to get coordinates
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address.trim(),
        }),
      })

      if (!geocodeResponse.ok) {
        throw new Error(
          `Failed to geocode address: ${geocodeResponse.statusText}`
        )
      }

      const geocodeData = await geocodeResponse.json()
      if (!geocodeData.success || !geocodeData.location) {
        throw new Error(
          `Could not find coordinates for address: ${formData.address}`
        )
      }

      const location: Location = geocodeData.location

      // Create lead object
      const leadData: Omit<Lead, 'id'> = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        type: formData.type,
        location,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        contactPerson: formData.contactPerson || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      }

      // Save to Firestore
      const leadId = await createManualLead(leadData)

      // Create complete lead object to pass back
      const newLead: Lead = {
        ...leadData,
        id: leadId,
      }

      onLeadCreated(newLead)
      handleClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create lead'
      setError(message)
      console.error('Error creating manual lead:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      type: 'other',
      phone: '',
      website: '',
      contactPerson: '',
      email: '',
      notes: '',
    })
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[998] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Create Manual Lead</h2>
            <p className="text-cyan-100 text-sm mt-1">
              Add a lead that wasn't found via Google Places
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Business Name - Required */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Local Swimming Pool"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          {/* Address - Required */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., 123 Main St, Raleigh, NC 27601"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Business Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="pool">Swimming Pool</option>
              <option value="hoa">HOA / Property Management</option>
              <option value="neighborhood">Neighborhood / Subdivision</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Contact Information Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Contact Information (optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Manager name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}
