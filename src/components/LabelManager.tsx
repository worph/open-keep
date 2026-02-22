'use client'

import { useState } from 'react'
import { X, Pencil, Trash2, Check, Tag, Plus } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLabelStore } from '@/stores/labelStore'

export function LabelManager() {
  const { labelManagerOpen, setLabelManagerOpen } = useUIStore()
  const { labels, createLabel, updateLabel, deleteLabel } = useLabelStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newLabelName, setNewLabelName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (!labelManagerOpen) return null

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleSaveEdit = async () => {
    if (editingId && editingName.trim()) {
      await updateLabel(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  const handleCreate = async () => {
    if (!newLabelName.trim()) return

    setIsCreating(true)
    await createLabel(newLabelName.trim())
    setNewLabelName('')
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this label? Notes with this label will not be deleted.')) {
      await deleteLabel(id)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setLabelManagerOpen(false)}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            Edit labels
          </h2>
          <button
            onClick={() => setLabelManagerOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Create new label"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none border-b border-transparent focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
            />
            {newLabelName.trim() && (
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Check className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

          <div className="max-h-64 overflow-y-auto space-y-1">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 group py-1"
              >
                <Tag className="w-5 h-5 text-gray-400" />

                {editingId === label.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none border-b border-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') {
                          setEditingId(null)
                          setEditingName('')
                        }
                      }}
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Check className="w-4 h-4 text-gray-500" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">
                      {label.name}
                    </span>
                    <button
                      onClick={() => handleStartEdit(label.id, label.name)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(label.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {labels.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No labels yet
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setLabelManagerOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
