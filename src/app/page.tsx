'use client'

import { useEffect } from 'react'
import { useNoteStore } from '@/stores/noteStore'
import { NoteInput } from '@/components/NoteInput'
import { NoteGrid } from '@/components/NoteGrid'

export default function HomePage() {
  const { notes, loading, fetchNotes } = useNoteStore()

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return (
    <div>
      <NoteInput />
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      ) : (
        <NoteGrid notes={notes} />
      )}
    </div>
  )
}
