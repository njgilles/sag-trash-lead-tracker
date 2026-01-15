'use client'

import { useState, useEffect } from 'react'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import { EmailTemplateDocument } from '@/types/lead'
import { TemplateList } from './TemplateList'
import { TemplateEditor } from './TemplateEditor'
import { FiX } from 'react-icons/fi'

interface TemplateManagerDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type ViewState = 'list' | 'create' | 'edit'

export function TemplateManagerDrawer({ isOpen, onClose }: TemplateManagerDrawerProps) {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } =
    useEmailTemplates()
  const [view, setView] = useState<ViewState>('list')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateDocument | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<EmailTemplateDocument | null>(null)

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setView('create')
  }

  const handleEdit = (template: EmailTemplateDocument) => {
    setSelectedTemplate(template)
    setView('edit')
  }

  const handleSave = async (data: Omit<EmailTemplateDocument, 'id' | 'createdDate' | 'lastUpdated'>) => {
    try {
      setIsSaving(true)

      if (view === 'create') {
        await createTemplate(data)
      } else if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, data)
      }

      setView('list')
      setSelectedTemplate(null)
    } catch (err) {
      console.error('Error saving template:', err)
      alert(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (template: EmailTemplateDocument) => {
    if (template.isSystem) {
      alert('Cannot delete system templates')
      return
    }

    setDeleteConfirm(template)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      setIsSaving(true)
      await deleteTemplate(deleteConfirm.id)
      setDeleteConfirm(null)
      setView('list')
    } catch (err) {
      console.error('Error deleting template:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setView('list')
    setSelectedTemplate(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-40 flex flex-col animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Email Templates</h1>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {view === 'list' && (
            <TemplateList
              templates={templates}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
            />
          )}

          {view === 'create' && (
            <TemplateEditor
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          )}

          {view === 'edit' && selectedTemplate && (
            <TemplateEditor
              template={selectedTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Template?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
