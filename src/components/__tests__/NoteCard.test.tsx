import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteCard } from '../NoteCard'
import type { Note } from '@/types'

// Mock the stores
vi.mock('@/stores/noteStore', () => ({
  useNoteStore: () => ({
    updateNote: vi.fn(),
    archiveNote: mockArchiveNote,
    unarchiveNote: vi.fn(),
    trashNote: vi.fn(),
    restoreNote: vi.fn(),
    togglePin: mockTogglePin,
    deleteNote: vi.fn(),
  }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    setEditingNoteId: vi.fn(),
    darkMode: false,
  }),
}))

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}))

const mockTogglePin = vi.fn()
const mockArchiveNote = vi.fn()

const baseNote: Note = {
  id: 'test-note',
  title: 'Test Title',
  content: 'Test content',
  type: 'note',
  color: 'default',
  isPinned: false,
  isArchived: false,
  isTrashed: false,
  trashedAt: null,
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  checklistItems: [],
  labels: [],
}

describe('NoteCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and content', () => {
    render(<NoteCard note={baseNote} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders checklist items (max 8)', () => {
    const checklistNote: Note = {
      ...baseNote,
      type: 'checklist',
      content: '',
      checklistItems: Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        text: `Item ${i + 1}`,
        isChecked: i % 2 === 0,
        position: i,
        noteId: baseNote.id,
      })),
    }

    render(<NoteCard note={checklistNote} />)

    // Should show first 8 items
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 8')).toBeInTheDocument()
    // Should not show items after 8
    expect(screen.queryByText('Item 9')).not.toBeInTheDocument()
    // Should show "+2 more items" indicator
    expect(screen.getByText('+ 2 more items')).toBeInTheDocument()
  })

  it('renders labels', () => {
    const noteWithLabels: Note = {
      ...baseNote,
      labels: [
        { noteId: baseNote.id, labelId: 'label-1', label: { id: 'label-1', name: 'Work', createdAt: new Date() } },
        { noteId: baseNote.id, labelId: 'label-2', label: { id: 'label-2', name: 'Personal', createdAt: new Date() } },
      ],
    }

    render(<NoteCard note={noteWithLabels} />)

    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('shows pin button with correct icon based on isPinned', () => {
    const { rerender } = render(<NoteCard note={baseNote} />)
    expect(screen.getByTitle('Pin')).toBeInTheDocument()

    const pinnedNote = { ...baseNote, isPinned: true }
    rerender(<NoteCard note={pinnedNote} />)
    expect(screen.getByTitle('Unpin')).toBeInTheDocument()
  })
})
