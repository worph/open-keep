'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Plus, Search } from 'lucide-react'
import { useLabelStore } from '@/stores/labelStore'
import { useNoteStore } from '@/stores/noteStore'

interface LabelPickerProps {
  noteId?: string
  selectedLabelIds: string[]
  onToggle?: (labelId: string) => void
  onClose: () => void
}

export function LabelPicker({
  noteId,
  selectedLabelIds,
  onToggle,
  onClose,
}: LabelPickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { labels, createLabel } = useLabelStore()
  const { updateNote } = useNoteStore()
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = async (labelId: string) => {
    if (onToggle) {
      onToggle(labelId)
    } else if (noteId) {
      const newLabelIds = selectedLabelIds.includes(labelId)
        ? selectedLabelIds.filter((id) => id !== labelId)
        : [...selectedLabelIds, labelId]
      await updateNote(noteId, { labelIds: newLabelIds })
    }
  }

  const handleCreate = async () => {
    if (!search.trim()) return

    setIsCreating(true)
    const label = await createLabel(search.trim())
    setIsCreating(false)

    if (label) {
      handleToggle(label.id)
      setSearch('')
    }
  }

  const showCreateOption =
    search.trim() &&
    !labels.some(
      (l) => l.name.toLowerCase() === search.toLowerCase().trim()
    )

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50"
    >
      <div className="p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or create label"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && showCreateOption) {
                handleCreate()
              }
            }}
          />
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto">
        {filteredLabels.map((label) => (
          <button
            key={label.id}
            onClick={() => handleToggle(label.id)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectedLabelIds.includes(label.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 dark:border-gray-500'
              }`}
            >
              {selectedLabelIds.includes(label.id) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
              {label.name}
            </span>
          </button>
        ))}

        {showCreateOption && (
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left border-t border-gray-200 dark:border-gray-600"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Create &quot;{search.trim()}&quot;
            </span>
          </button>
        )}

        {filteredLabels.length === 0 && !showCreateOption && (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No labels found
          </div>
        )}
      </div>
    </div>
  )
}
