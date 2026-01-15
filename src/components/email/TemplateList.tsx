'use client'

import { EmailTemplateDocument } from '@/types/lead'
import { FiEdit2, FiTrash2, FiLock } from 'react-icons/fi'

interface TemplateListProps {
  templates: EmailTemplateDocument[]
  loading: boolean
  onEdit: (template: EmailTemplateDocument) => void
  onDelete: (template: EmailTemplateDocument) => void
  onCreateNew: () => void
}

export function TemplateList({
  templates,
  loading,
  onEdit,
  onDelete,
  onCreateNew,
}: TemplateListProps) {
  // Separate system and user templates
  const systemTemplates = templates.filter((t) => t.isSystem)
  const userTemplates = templates.filter((t) => !t.isSystem)

  const getLeadTypeColor = (leadType: string) => {
    const colors: Record<string, string> = {
      pool: 'bg-red-100 text-red-800',
      hoa: 'bg-blue-100 text-blue-800',
      neighborhood: 'bg-green-100 text-green-800',
      other: 'bg-purple-100 text-purple-800',
    }
    return colors[leadType] || colors.other
  }

  const renderTemplateItem = (template: EmailTemplateDocument, isSystem: boolean) => (
    <div
      key={template.id}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            {isSystem && <FiLock className="w-4 h-4 text-gray-500" title="System template" />}
            {template.recommended && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Recommended
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {template.leadTypes.map((type) => (
              <span
                key={type}
                className={`text-xs px-2 py-1 rounded capitalize ${getLeadTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => onEdit(template)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
            title="Edit template"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          {!isSystem && (
            <button
              onClick={() => onDelete(template)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Delete template"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
        <button
          onClick={onCreateNew}
          className="px-3 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition"
        >
          Create New Template
        </button>
      </div>

      {/* System Templates Section */}
      {systemTemplates.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiLock className="w-4 h-4" /> System Templates
          </h3>
          <div className="space-y-3">
            {systemTemplates.map((template) => renderTemplateItem(template, true))}
          </div>
        </div>
      )}

      {/* User Templates Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Custom Templates {userTemplates.length > 0 && `(${userTemplates.length})`}
        </h3>
        {userTemplates.length > 0 ? (
          <div className="space-y-3">
            {userTemplates.map((template) => renderTemplateItem(template, false))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
            <p className="text-sm">No custom templates yet.</p>
            <button
              onClick={onCreateNew}
              className="text-cyan-600 hover:underline text-sm mt-2"
            >
              Create your first template
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
