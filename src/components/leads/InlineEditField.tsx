'use client'

import { useState, useRef, useEffect } from 'react'

interface InlineEditFieldProps {
  label: string
  value: string
  onSave: (newValue: string) => Promise<void>
  placeholder?: string
  multiline?: boolean
  rows?: number
  type?: 'text' | 'email' | 'url'
  disabled?: boolean
  className?: string
}

export function InlineEditField({
  label,
  value,
  onSave,
  placeholder = '',
  multiline = false,
  rows = 3,
  type = 'text',
  disabled = false,
  className = '',
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Move cursor to end for text inputs
      if (!multiline) {
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        )
      } else {
        // For textarea, move cursor to end
        const ta = inputRef.current as HTMLTextAreaElement
        ta.setSelectionRange(ta.value.length, ta.value.length)
      }
    }
  }, [isEditing, multiline])

  const handleSave = async () => {
    if (inputValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')
    setErrorMessage('')

    try {
      await onSave(inputValue)
      setSaveStatus('success')
      setIsEditing(false)
      // Clear success indicator after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save')
      // Auto-reset error after 4 seconds
      setTimeout(() => {
        setSaveStatus('idle')
        setErrorMessage('')
        setInputValue(value) // Reset to original value
      }, 4000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setInputValue(value)
    setIsEditing(false)
    setSaveStatus('idle')
    setErrorMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isEditing) {
    return (
      <div className={`group p-3 rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
            <p className="text-gray-900 break-all whitespace-pre-wrap">
              {value ? (
                <span className="font-medium">{value}</span>
              ) : (
                <span className="text-gray-400 italic">
                  {placeholder || 'Not set'}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className="mt-0.5 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={`Edit ${label.toLowerCase()}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg bg-blue-50 border-2 border-cyan-300 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed font-sm"
        />
      ) : (
        <input
          ref={inputRef as React.Ref<HTMLInputElement>}
          type={type}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      )}

      {/* Error message */}
      {saveStatus === 'error' && errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            saveStatus === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving' && (
            <>
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Saving...
            </>
          )}
          {saveStatus === 'success' && (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Saved!
            </>
          )}
          {saveStatus === 'idle' && !isSaving && 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
