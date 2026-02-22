'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
} from 'lucide-react'
import { useState } from 'react'
import { useNoteStore } from '@/stores/noteStore'
import { useUIStore } from '@/stores/uiStore'
import { ColorPicker } from './ColorPicker'
import { LabelPicker } from './LabelPicker'
import { getNoteColor } from '@/lib/utils'
import type { Note } from '@/types'

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const { updateNote, archiveNote, unarchiveNote, trashNote, restoreNote, togglePin, deleteNote } =
    useNoteStore()
  const { setEditingNoteId, darkMode } = useUIStore()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: getNoteColor(note.color, darkMode),
  }

  const handleToggleChecklistItem = async (itemId: string) => {
    const updatedItems = note.checklistItems.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    )
    await updateNote(note.id, { checklistItems: updatedItems })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="note-card rounded-lg border border-gray-200 dark:border-gray-600 group cursor-pointer"
      {...attributes}
      {...listeners}
    >
      <div
        className="p-3"
        onClick={() => !note.isTrashed && setEditingNoteId(note.id)}
      >
        {note.title && (
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
            {note.title}
          </h3>
        )}

        {note.type === 'checklist' ? (
          <ul className="space-y-1">
            {note.checklistItems.slice(0, 8).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleChecklistItem(item.id)
                }}
              >
                {item.isChecked ? (
                  <Check className="w-4 h-4 text-gray-500" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                <span
                  className={`${
                    item.isChecked
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
            {note.checklistItems.length > 8 && (
              <li className="text-xs text-gray-500">
                + {note.checklistItems.length - 8} more items
              </li>
            )}
          </ul>
        ) : (
          note.content && (
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-6">
              {note.content}
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
