'use client'

import { useState, useRef } from 'react'
import { parseMultipleContractXLSX, validateContractData, ContractData } from '@/lib/contract-parser'
import { importContractsToLeads, ImportProgress } from '@/lib/batch-contract-import'
import { ContractPreviewTable } from './ContractPreviewTable'

interface ContractUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (count: number) => void
}

type ModalStep = 'upload' | 'preview' | 'importing' | 'complete'

export function ContractUploadModal({
  isOpen,
  onClose,
  onImportComplete,
}: ContractUploadModalProps) {
  const [step, setStep] = useState<ModalStep>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [contracts, setContracts] = useState<ContractData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const excelFiles = selectedFiles.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))

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
    const excelFiles = droppedFiles.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))

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

    try {
      const result = await importContractsToLeads(contractsToImport, (progress) => {
        setImportProgress(progress)
      })

      if (result.success) {
        setImportedCount(result.importedCount)
        setStep('complete')
        onImportComplete(result.importedCount)
      } else {
        // Show errors but don't fail if some contracts imported
        const errorMsg = result.errors
          .map(e => `${e.file}: ${e.error}`)
          .join('\n')
        setError(`Imported ${result.importedCount} contracts with ${result.failedCount} errors:\n${errorMsg}`)
        setImportedCount(result.importedCount)
        setStep('complete')
        if (result.importedCount > 0) {
          onImportComplete(result.importedCount)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
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
    onClose()
  }

  const handleBackToUpload = () => {
    setStep('upload')
    setContracts([])
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[998] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Upload Contracts</h2>
            <p className="text-cyan-100 text-sm mt-1">
              Bulk import customer contracts as leads
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
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <p className="font-semibold">Error:</p>
              <p className="whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  Select Excel files from your contract template. Files must be:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Excel template files (.xlsx or .xls)</li>
                  <li>Filled in with customer information</li>
                  <li>Multiple files can be uploaded at once</li>
                </ul>
              </div>

              {/* File Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center cursor-pointer hover:bg-cyan-50 transition"
              >
                <svg
                  className="w-12 h-12 text-cyan-400 mx-auto mb-2"
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
                <p className="text-gray-700 font-medium">
                  Drag Excel files here or click to select
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  .xlsx or .xls files
                </p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Select Files
              </button>

              {/* File List */}
              {files.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                      >
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
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
            <div className="text-center space-y-4">
              <div className="spinner h-10 w-10 mx-auto"></div>
              <p className="text-gray-700 font-medium">Importing contracts...</p>
              {importProgress && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {importProgress.currentFile}
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(importProgress.processed / importProgress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {importProgress.processed} of {importProgress.total}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-green-600"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Import Complete
                </h3>
                <p className="text-gray-600 mt-2">
                  {importedCount} contract{importedCount !== 1 ? 's' : ''} successfully imported
                </p>
                {error && (
                  <p className="text-sm text-orange-600 mt-2">
                    Some contracts had errors. Check above for details.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
          {(step === 'upload' || step === 'preview') && (
            <>
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed font-medium transition"
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
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed font-medium transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleImportContracts(contracts)}
                    disabled={loading}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
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
