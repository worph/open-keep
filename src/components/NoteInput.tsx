'use client'

import { useState, useRef } from 'react'
import {
  CheckSquare,
  Palette,
  Tag,
  Pin,
  X,
  Plus,
  Square,
  Check,
} from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'
import { useUIStore } from '@/stores/uiStore'
import { ColorPicker } from './ColorPicker'
import { LabelPicker } from './LabelPicker'
import { getNoteColor } from '@/lib/utils'

interface ChecklistItem {
  id: string
  text: string
  isChecked: boolean
}

export function NoteInput() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isChecklist, setIsChecklist] = useState(false)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [color, setColor] = useState('default')
  const [isPinned, setIsPinned] = useState(false)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  const inputRef = useRef<HTMLDivElement>(null)
  const { createNote } = useNoteStore()
  const { darkMode } = useUIStore()

  const reset = () => {
    setTitle('')
    setContent('')
    setIsChecklist(false)
    setChecklistItems([])
    setColor('default')
    setIsPinned(false)
    setSelectedLabelIds([])
    setIsExpanded(false)
    setShowColorPicker(false)
    setShowLabelPicker(false)
  }

  const handleSubmit = async () => {
    const hasContent =
      title.trim() ||
      content.trim() ||
      checklistItems.some((item) => item.text.trim())

    if (!hasContent) {
      reset()
      return
    }

    await createNote({
      title: title.trim(),
      content: isChecklist ? '' : content.trim(),
      type: isChecklist ? 'checklist' : 'note',
      color,
      isPinned,
      checklistItems: isChecklist
        ? checklistItems
            .filter((item) => item.text.trim())
            .map((item) => ({ text: item.text, isChecked: item.isChecked }))
        : undefined,
      labelIds: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
    })

    reset()
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      handleSubmit()
    }
  }

  const addChecklistItem = () => {
    setChecklistItems([
      ...checklistItems,
      { id: crypto.randomUUID(), text: '', isChecked: false },
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

  const toggleChecklist = () => {
    if (!isChecklist) {
      const lines = content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => ({
          id: crypto.randomUUID(),
          text: line,
          isChecked: false,
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

  if (!isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="max-w-xl mx-auto mb-8 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md cursor-text"
        style={{ backgroundColor: getNoteColor(color, darkMode) }}
      >
        <div className="flex items-center p-4">
          <span className="flex-1 text-gray-500 dark:text-gray-400">
            Take a note...
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsChecklist(true)
              setIsExpanded(true)
            }}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          >
            <CheckSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleClickOutside}
    >
      <div
        ref={inputRef}
        className="max-w-xl mx-auto mt-24 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg"
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
              <Pin
                className={`w-5 h-5 ${
                  isPinned
                    ? 'text-gray-800 dark:text-gray-100 fill-current'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              />
            </button>
          </div>

          {isChecklist ? (
            <div className="space-y-1">
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
              rows={3}
              className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none resize-none"
            />
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
          </div>

          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
