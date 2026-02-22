'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Pin,
  PinOff,
  Palette,
  Tag,
  Archive,
  Trash2,
  CheckSquare,
  Plus,
  Square,
  Check,
} from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'
import { useUIStore } from '@/stores/uiStore'
import { ColorPicker } from './ColorPicker'
import { LabelPicker } from './LabelPicker'
import { getNoteColor } from '@/lib/utils'
import type { ChecklistItem } from '@/types'

export function NoteEditor() {
  const { notes, updateNote, archiveNote, trashNote } = useNoteStore()
  const { editingNoteId, setEditingNoteId, darkMode } = useUIStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isChecklist, setIsChecklist] = useState(false)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [color, setColor] = useState('default')
  const [isPinned, setIsPinned] = useState(false)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  const note = notes.find((n) => n.id === editingNoteId)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setIsChecklist(note.type === 'checklist')
      setChecklistItems(note.checklistItems)
      setColor(note.color)
      setIsPinned(note.isPinned)
      setSelectedLabelIds(note.labels.map((l) => l.labelId))
    }
  }, [note])

  if (!note) return null

  const handleClose = async () => {
    await updateNote(note.id, {
      title: title.trim(),
      content: isChecklist ? '' : content.trim(),
      type: isChecklist ? 'checklist' : 'note',
      color,
      isPinned,
      checklistItems: isChecklist
        ? checklistItems.map((item, index) => ({
            ...item,
            position: index,
          }))
        : [],
      labelIds: selectedLabelIds,
    })
    setEditingNoteId(null)
    setShowColorPicker(false)
    setShowLabelPicker(false)
  }

  const handleArchive = async () => {
    await archiveNote(note.id)
    setEditingNoteId(null)
  }

  const handleTrash = async () => {
    await trashNote(note.id)
    setEditingNoteId(null)
  }

  const toggleChecklist = () => {
    if (!isChecklist) {
      const lines = content
        .split('\n')
        .filter((line) => line.trim())
        .map((line, index) => ({
          id: crypto.randomUUID(),
          text: line,
          isChecked: false,
          position: index,
          noteId: note.id,
        }))
      setChecklistItems(lines.length > 0 ? lines : [])
      setContent('')
    } else {
      const text = checklistItems.map((item) => item.text).join('\n')
      setContent(text)
      setChecklistItems([])
    }
    setIsChecklist(!isChecklist)
  }

  const addChecklistItem = () => {
    setChecklistItems([
      ...checklistItems,
      {
        id: crypto.randomUUID(),
        text: '',
        isChecked: false,
        position: checklistItems.length,
        noteId: note.id,
      },
    ])
  }

  const updateChecklistItem = (id: string, text: string) => {
    setChecklistItems(
      checklistItems.map((item) => (item.id === id ? { ...item, text } : item))
    )
  }

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    )
  }

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-lg shadow-xl"
        style={{ backgroundColor: getNoteColor(color, darkMode) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center mb-2">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-transparent text-lg font-medium text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            />
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
            >
              {isPinned ? (
                <PinOff className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Pin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {isChecklist ? (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className="p-0.5"
                  >
                    {item.isChecked ? (
                      <Check className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                    placeholder="List item"
                    className={`flex-1 bg-transparent text-sm outline-none ${
                      item.isChecked
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChecklistItem()
                      }
                    }}
                  />
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
              <button
                onClick={addChecklistItem}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1"
              >
                <Plus className="w-4 h-4" />
                List item
              </button>
            </div>
          ) : (
            <textarea
              placeholder="Take a note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none resize-none"
            />
          )}

          {selectedLabelIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedLabelIds.map((labelId) => {
                const noteLabel = note.labels.find((l) => l.labelId === labelId)
                return noteLabel ? (
                  <span
                    key={labelId}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                  >
                    {noteLabel.label.name}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleChecklist}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title={isChecklist ? 'Switch to note' : 'Switch to checklist'}
            >
              <CheckSquare className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker)
                  setShowLabelPicker(false)
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Background color"
              >
                <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              {showColorPicker && (
                <ColorPicker
                  selectedColor={color}
                  onSelect={(c) => {
                    setColor(c)
                    setShowColorPicker(false)
                  }}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowLabelPicker(!showLabelPicker)
                  setShowColorPicker(false)
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Add label"
              >
                <Tag className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              {showLabelPicker && (
                <LabelPicker
                  noteId={note.id}
                  selectedLabelIds={selectedLabelIds}
                  onToggle={(labelId) => {
                    setSelectedLabelIds((prev) =>
                      prev.includes(labelId)
                        ? prev.filter((id) => id !== labelId)
                        : [...prev, labelId]
                    )
                  }}
                  onClose={() => setShowLabelPicker(false)}
                />
              )}
            </div>

            <button
              onClick={handleArchive}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title="Archive"
            >
              <Archive className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={handleTrash}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
