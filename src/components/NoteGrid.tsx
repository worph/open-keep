'use client'

import { useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useNoteStore } from '@/stores/noteStore'
import { useUIStore } from '@/stores/uiStore'
import { NoteCard } from './NoteCard'
import type { Note } from '@/types'

interface NoteGridProps {
  notes: Note[]
}

export function NoteGrid({ notes }: NoteGridProps) {
  const { gridView } = useUIStore()
  const { reorderNotes } = useNoteStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const pinnedNotes = notes.filter((note) => note.isPinned)
  const unpinnedNotes = notes.filter((note) => !note.isPinned)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const allNotes = [...pinnedNotes, ...unpinnedNotes]
      const oldIndex = allNotes.findIndex((n) => n.id === active.id)
      const newIndex = allNotes.findIndex((n) => n.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(allNotes, oldIndex, newIndex)
        await reorderNotes(newOrder.map((n) => n.id))
      }
    }
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-lg">No notes yet</p>
        <p className="text-sm mt-1">Click the input above to create one</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {pinnedNotes.length > 0 && (
        <>
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Pinned
          </h2>
          <SortableContext
            items={pinnedNotes.map((n) => n.id)}
            strategy={rectSortingStrategy}
          >
            <div className={`masonry-grid mb-8 ${gridView ? '' : 'list-view'}`}>
              {pinnedNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </SortableContext>
          {unpinnedNotes.length > 0 && (
            <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Others
            </h2>
          )}
        </>
      )}

      <SortableContext
        items={unpinnedNotes.map((n) => n.id)}
        strategy={rectSortingStrategy}
      >
        <div className={`masonry-grid ${gridView ? '' : 'list-view'}`}>
          {unpinnedNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
