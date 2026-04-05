'use client'

import { useSortable } from '@dnd-kit/sortable'
import {
  Pin,
  PinOff,
  Palette,
  Tag,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
  Check,
  Square,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState, useMemo, ReactNode } from 'react'
import { useNoteStore } from '@/stores/noteStore'
import { useUIStore } from '@/stores/uiStore'
import { ColorPicker } from './ColorPicker'
import { LabelPicker } from './LabelPicker'
import { getNoteColor } from '@/lib/utils'
import type { Note } from '@/types'

const URL_REGEX = /(https?:\/\/[^\s<]+)/

function linkify(text: string): ReactNode {
  const parts = text.split(URL_REGEX)
  if (parts.length === 1) return text
  // split with capture group puts matches at odd indices
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      part
    )
  )
}

interface NoteCardContentProps {
  note: Note
  style?: React.CSSProperties
  className?: string
}

export function NoteCardContent({ note, style, className }: NoteCardContentProps) {
  const { updateNote, archiveNote, unarchiveNote, trashNote, restoreNote, togglePin, deleteNote } =
    useNoteStore()
  const { setEditingNoteId, darkMode } = useUIStore()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [completedCollapsed, setCompletedCollapsed] = useState(true)

  const uncheckedItems = useMemo(
    () => note.checklistItems.filter((item) => !item.isChecked),
    [note.checklistItems]
  )
  const checkedItems = useMemo(
    () => note.checklistItems.filter((item) => item.isChecked),
    [note.checklistItems]
  )

  const handleToggleChecklistItem = async (itemId: string) => {
    const updatedItems = note.checklistItems.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    )
    await updateNote(note.id, { checklistItems: updatedItems })
  }

  return (
    <div
      style={{
        backgroundColor: getNoteColor(note.color, darkMode),
        ...style,
      }}
      className={`note-card rounded-lg border group cursor-pointer overflow-hidden ${
        note.color === 'default'
          ? 'border-gray-200 dark:border-gray-600'
          : 'border-transparent'
      } ${className ?? ''}`}
    >
      <div
        className="p-3 overflow-hidden"
        onClick={() => !note.isTrashed && setEditingNoteId(note.id)}
      >
        {note.title && (
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
            {note.title}
          </h3>
        )}

        {note.type === 'checklist' ? (
          <div className="space-y-1">
            <ul className="space-y-1">
              {uncheckedItems.slice(0, 8).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-sm min-w-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleChecklistItem(item.id)
                  }}
                >
                  <Square className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 break-words min-w-0">
                    {linkify(item.text)}
                  </span>
                </li>
              ))}
              {uncheckedItems.length > 8 && (
                <li className="text-xs text-gray-500">
                  + {uncheckedItems.length - 8} more items
                </li>
              )}
            </ul>

            {checkedItems.length > 0 && (
              <>
                <button
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 py-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCompletedCollapsed(!completedCollapsed)
                  }}
                >
                  {completedCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {checkedItems.length} completed {checkedItems.length === 1 ? 'item' : 'items'}
                </button>
                {!completedCollapsed && (
                  <ul className="space-y-1">
                    {checkedItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 text-sm min-w-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleChecklistItem(item.id)
                        }}
                      >
                        <Check className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="line-through text-gray-400 dark:text-gray-500 break-words min-w-0">
                          {linkify(item.text)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        ) : (
          note.content && (
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-6 break-words">
              {linkify(note.content)}
            </p>
          )
        )}

        {note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.labels.map((nl) => (
              <span
                key={nl.labelId}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300"
              >
                {nl.label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-1 px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {!note.isTrashed && (
          <>
            <button
              onClick={() => togglePin(note.id)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              {note.isPinned ? (
                <PinOff className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Pin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Background color"
              >
                <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              {showColorPicker && (
                <ColorPicker
                  selectedColor={note.color}
                  onSelect={(color) => {
                    updateNote(note.id, { color })
                    setShowColorPicker(false)
                  }}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Add label"
              >
                <Tag className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              {showLabelPicker && (
                <LabelPicker
                  noteId={note.id}
                  selectedLabelIds={note.labels.map((l) => l.labelId)}
                  onClose={() => setShowLabelPicker(false)}
                />
              )}
            </div>

            {note.isArchived ? (
              <button
                onClick={() => unarchiveNote(note.id)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Unarchive"
              >
                <ArchiveRestore className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <button
                onClick={() => archiveNote(note.id)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Archive"
              >
                <Archive className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            )}

            <button
              onClick={() => trashNote(note.id)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}

        {note.isTrashed && (
          <>
            <button
              onClick={() => restoreNote(note.id)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => deleteNote(note.id)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              title="Delete forever"
            >
              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({ id: note.id })

  return (
    <div
      ref={setNodeRef}
      className="w-full overflow-hidden"
      style={{ opacity: isDragging ? 0.3 : 1 }}
      {...attributes}
      {...listeners}
    >
      <NoteCardContent note={note} />
    </div>
  )
}
