'use client'

import { useState, useRef } from 'react'
import { parseMultipleContractXLSX, ContractData } from '@/lib/contract-parser'
import { importContractsToLeads, ImportProgress } from '@/lib/batch-contract-import'
import { ContractPreviewTable } from './ContractPreviewTable'
import { Toast } from '@/components/ui/Toast'

interface ImportContractsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (count: number) => void
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete'

export function ImportContractsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportContractsModalProps) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [contracts, setContracts] = useState<ContractData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const excelFiles = selectedFiles.filter(
      f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    )

    if (excelFiles.length === 0) {
      setError('Please select Excel files (.xlsx or .xls)')
      return
    }

    if (excelFiles.length !== selectedFiles.length) {
      setError('Only Excel files (.xlsx or .xls) are supported')
    }

    setFiles(excelFiles)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = Array.from(e.dataTransfer.files)
    const excelFiles = droppedFiles.filter(
      f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    )

    if (excelFiles.length === 0) {
      setError('Please drop Excel files (.xlsx or .xls) only')
      return
    }

    setFiles(excelFiles)
    setError(null)
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleParseFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one Excel file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const parsed = await parseMultipleContractXLSX(files)
      setContracts(parsed)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Excel files')
    } finally {
      setLoading(false)
    }
  }

  const handleImportContracts = async (contractsToImport: ContractData[]) => {
    setStep('importing')
    setError(null)
    setLoading(true)
    setShowToast(false)

    try {
      const result = await importContractsToLeads(contractsToImport, (progress) => {
        setImportProgress(progress)
      })

      if (result.success) {
        setImportedCount(result.importedCount)
        setToastType('success')
        setShowToast(true)
        setStep('complete')
        onSuccess?.(result.importedCount)
      } else {
        const errorMsg = result.errors
          .map(e => `${e.file}: ${e.error}`)
          .join('\n')
        setError(
          `Imported ${result.importedCount} contracts with ${result.failedCount} errors:\n${errorMsg}`
        )
        setImportedCount(result.importedCount)
        setToastType('error')
        setShowToast(true)
        setStep('complete')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setFiles([])
    setContracts([])
    setError(null)
    setLoading(false)
    setImportedCount(0)
    setImportProgress(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleBackToUpload = () => {
    setStep('upload')
    setContracts([])
    setError(null)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={
            toastType === 'success'
              ? `Successfully imported ${importedCount} contract${importedCount !== 1 ? 's' : ''}!`
              : `Imported ${importedCount} contract${importedCount !== 1 ? 's' : ''} with errors`
          }
          type={toastType}
          duration={5000}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-dark-border" style={{ backgroundColor: '#0f1e2e' }}>
        {/* Header */}
        <div className="border-b border-dark-border p-6 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: '#1a2a3a' }}>
          <div>
            <h2 className="text-2xl font-bold text-white">Import Contracts</h2>
            <p className="text-dark-50 text-sm mt-1">
              Upload Excel files to import customer contracts
            </p>
          </div>
          <button
            onClick={handleClose}
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <p className="font-semibold">Error:</p>
                <p className="whitespace-pre-wrap mt-2">{error}</p>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-6">
                <div className="text-sm text-dark-50">
                  <p className="mb-2">Select Excel files from your contract template. You can:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Upload multiple Excel files at once</li>
                    <li>System automatically extracts data from the correct rows</li>
                    <li>Review and edit parsed data before importing</li>
                  </ul>
                </div>

                {/* File Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-cyan-400 rounded-lg p-12 text-center cursor-pointer hover:bg-dark-700 transition"
                >
                  <svg
                    className="w-16 h-16 text-cyan-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <p className="text-white font-medium text-lg">
                    Drag Excel files here or click to select
                  </p>
                  <p className="text-dark-50 text-sm mt-2">.xlsx or .xls files</p>
                </div>

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dark-border rounded-lg hover:bg-dark-700 font-medium transition text-white"
                >
                  Browse Files
                </button>

                {/* File List */}
                {files.length > 0 && (
                  <div className="bg-dark-700 rounded-lg p-4 border border-dark-border">
                    <h3 className="font-semibold text-white mb-3">
                      Selected Files ({files.length})
                    </h3>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-dark-600 p-3 rounded border border-dark-border"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-dark-50"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                            </svg>
                            <span className="text-sm text-white">{file.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <ContractPreviewTable
                contracts={contracts}
                onConfirm={handleImportContracts}
                onBack={handleBackToUpload}
                loading={loading}
              />
            )}

            {step === 'importing' && (
              <div className="text-center space-y-6 py-12">
                <div className="spinner h-12 w-12 mx-auto"></div>
                <div>
                  <p className="text-white font-medium text-lg">Importing contracts...</p>
                  {importProgress && (
                    <div className="bg-dark-700 rounded-lg p-6 mt-4">
                      <p className="text-sm text-dark-50 mb-3">
                        {importProgress.currentFile}
                      </p>
                      <div className="w-full bg-dark-500 rounded-full h-3">
                        <div
                          className="bg-cyan-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${(importProgress.processed / importProgress.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-dark-100 mt-3">
                        {importProgress.processed} of {importProgress.total}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Import Complete</h2>
                  <p className="text-dark-50 mt-2 text-lg">
                    {importedCount} contract{importedCount !== 1 ? 's' : ''} successfully
                    imported
                  </p>
                  {error && (
                    <p className="text-sm text-orange-400 mt-4 bg-orange-900/30 border border-orange-700 rounded p-3">
                      Some contracts had errors. See details above.
                    </p>
                  )}
                  <p className="text-sm text-dark-50 mt-4">
                    All imported leads are now marked as contacted and appear in your
                    Contacts list.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-dark-700 border-t border-dark-border p-6 flex justify-end gap-3">
          {(step === 'upload' || step === 'preview') && (
            <>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-dark-500 text-white rounded-lg hover:bg-dark-600 font-medium transition"
              >
                Cancel
              </button>
              {step === 'upload' && (
                <button
                  onClick={handleParseFiles}
                  disabled={loading || files.length === 0}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
                >
                  {loading ? 'Parsing...' : 'Next'}
                </button>
              )}
              {step === 'preview' && (
                <>
                  <button
                    onClick={handleBackToUpload}
                    disabled={loading}
                    className="px-6 py-2 bg-dark-500 text-white rounded-lg hover:bg-dark-600 disabled:cursor-not-allowed font-medium transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleImportContracts(contracts)}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Importing...' : 'Import All'}
                  </button>
                </>
              )}
            </>
          )}
          {step === 'complete' && (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-medium transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
