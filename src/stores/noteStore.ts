import { create } from 'zustand'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types'

interface NoteState {
  notes: Note[]
  loading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  fetchNotes: (params?: { archived?: boolean; trashed?: boolean; labelId?: string }) => Promise<void>
  createNote: (input: CreateNoteInput) => Promise<Note | null>
  updateNote: (id: string, input: UpdateNoteInput) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  archiveNote: (id: string) => Promise<void>
  unarchiveNote: (id: string) => Promise<void>
  trashNote: (id: string) => Promise<void>
  restoreNote: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  reorderNotes: (noteIds: string[]) => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchNotes: async (params) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params?.archived) searchParams.set('archived', 'true')
      if (params?.trashed) searchParams.set('trashed', 'true')
      if (params?.labelId) searchParams.set('labelId', params.labelId)

      const query = get().searchQuery
      if (query) searchParams.set('q', query)

      const url = `/api/notes${searchParams.toString() ? `?${searchParams}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch notes')
      const notes = await res.json()
      set({ notes, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createNote: async (input) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create note')
      const note = await res.json()
      set((state) => ({ notes: [note, ...state.notes] }))
      return note
    } catch (error) {
      set({ error: (error as Error).message })
      return null
    }
  },

  updateNote: async (id, input) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update note')
      const updatedNote = await res.json()
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteNote: async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete note')
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  archiveNote: async (id) => {
    await get().updateNote(id, { isArchived: true })
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  },

  unarchiveNote: async (id) => {
    await get().updateNote(id, { isArchived: false })
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  },

  trashNote: async (id) => {
    await get().updateNote(id, { isTrashed: true })
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  },

  restoreNote: async (id) => {
    await get().updateNote(id, { isTrashed: false })
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned })
    }
  },

  reorderNotes: async (noteIds) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteIds }),
      })
      if (!res.ok) throw new Error('Failed to reorder notes')
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
}))
