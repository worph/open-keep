import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useNoteStore } from '../noteStore'
import type { Note } from '@/types'

const mockNote: Note = {
  id: 'note-1',
  title: 'Test Note',
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

describe('noteStore', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    useNoteStore.setState({ notes: [], loading: false, error: null, searchQuery: '' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchNotes', () => {
    it('fetches notes and updates state', async () => {
      const mockNotes = [mockNote]
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNotes),
      } as Response)

      await useNoteStore.getState().fetchNotes()

      expect(fetch).toHaveBeenCalledWith('/api/notes')
      expect(useNoteStore.getState().notes).toEqual(mockNotes)
      expect(useNoteStore.getState().loading).toBe(false)
    })

    it('handles fetch error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response)

      await useNoteStore.getState().fetchNotes()

      expect(useNoteStore.getState().error).toBe('Failed to fetch notes')
      expect(useNoteStore.getState().loading).toBe(false)
    })
  })

  describe('createNote', () => {
    it('creates note and prepends to state', async () => {
      const newNote = { ...mockNote, id: 'new-note', title: 'New Note' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(newNote),
      } as Response)

      useNoteStore.setState({ notes: [mockNote] })
      const result = await useNoteStore.getState().createNote({ title: 'New Note' })

      expect(result).toEqual(newNote)
      expect(useNoteStore.getState().notes[0]).toEqual(newNote)
      expect(useNoteStore.getState().notes.length).toBe(2)
    })
  })

  describe('archiveNote', () => {
    it('archives note and removes from state', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...mockNote, isArchived: true }),
      } as Response)

      useNoteStore.setState({ notes: [mockNote] })
      await useNoteStore.getState().archiveNote(mockNote.id)

      expect(useNoteStore.getState().notes).toEqual([])
    })
  })

  describe('trashNote', () => {
    it('trashes note and removes from state', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...mockNote, isTrashed: true }),
      } as Response)

      useNoteStore.setState({ notes: [mockNote] })
      await useNoteStore.getState().trashNote(mockNote.id)

      expect(useNoteStore.getState().notes).toEqual([])
    })
  })

  describe('togglePin', () => {
    it('toggles isPinned state', async () => {
      const toggledNote = { ...mockNote, isPinned: true }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(toggledNote),
      } as Response)

      useNoteStore.setState({ notes: [mockNote] })
      await useNoteStore.getState().togglePin(mockNote.id)

      expect(fetch).toHaveBeenCalledWith(
        `/api/notes/${mockNote.id}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isPinned: true }),
        })
      )
    })
  })
})
