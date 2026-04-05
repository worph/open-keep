'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Masonry } from 'masonic'
import { useNoteStore } from '@/stores/noteStore'
import { useUIStore } from '@/stores/uiStore'
import { NoteCard, NoteCardContent } from './NoteCard'
import type { Note } from '@/types'

interface NoteGridProps {
  notes: Note[]
}

function MasonryGrid({ notes }: { notes: Note[] }) {
  return (
    <Masonry
      items={notes}
      columnWidth={240}
      columnGutter={16}
      overscanBy={2}
      render={({ data }: { data: Note }) => <NoteCard note={data} />}
    />
  )
}

function ListGrid({ notes }: { notes: Note[] }) {
  return (
    <div className="masonry-grid list-view">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}

export function NoteGrid({ notes }: NoteGridProps) {
  const { gridView } = useUIStore()
  const { reorderNotes } = useNoteStore()
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const activeNote = activeId
    ? notes.find((n) => n.id === activeId) ?? null
    : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
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

  const GridComponent = gridView ? MasonryGrid : ListGrid

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
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
            <div className="mb-8">
              <GridComponent notes={pinnedNotes} />
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
        <GridComponent notes={unpinnedNotes} />
      </SortableContext>

      <DragOverlay>
        {activeNote ? (
          <div style={{ width: 240 }}>
            <NoteCardContent note={activeNote} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
