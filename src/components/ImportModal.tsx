'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useNoteStore } from '@/stores/noteStore'
import { useLabelStore } from '@/stores/labelStore'
import { parseKeepZip } from '@/lib/importKeep'

type Status = 'idle' | 'parsing' | 'uploading' | 'done' | 'error'

export function ImportModal() {
  const { importModalOpen, setImportModalOpen } = useUIStore()
  const fetchNotes = useNoteStore((s) => s.fetchNotes)
  const fetchLabels = useLabelStore((s) => s.fetchLabels)

  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setMessage('')
    setDragOver(false)
  }, [])

  const handleClose = useCallback(() => {
    setImportModalOpen(false)
    // Reset after close animation
    setTimeout(reset, 150)
  }, [setImportModalOpen, reset])

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setStatus('error')
      setMessage('Please drop a ZIP file.')
      return
    }

    try {
      setStatus('parsing')
      setMessage('Parsing ZIP file...')

      const notes = await parseKeepZip(file)

      if (notes.length === 0) {
        setStatus('error')
        setMessage('No Google Keep notes found in this ZIP.')
        return
      }

      setStatus('uploading')
      setMessage(`Importing ${notes.length} notes...`)

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error: ${res.status}`)
      }

      setStatus('done')
      setMessage(`Successfully imported ${notes.length} notes!`)

      // Refresh the UI
      await Promise.all([fetchNotes(), fetchLabels()])
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Import failed.')
    }
  }, [fetchNotes, fetchLabels])

  if (!importModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            Import from Google Keep
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'idle' && (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Drop your Google Takeout ZIP here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
              <p className="text-xs text-red-500 dark:text-red-400 mt-3 text-center">
                This will replace all existing notes and labels.
              </p>
            </>
          )}

          {(status === 'parsing' || status === 'uploading') && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
              <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
            </div>
          )}

          {status === 'done' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
              <button
                onClick={reset}
                className="mt-4 text-sm text-amber-600 dark:text-amber-400 hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
