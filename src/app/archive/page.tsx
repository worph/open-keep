'use client'

import { useEffect } from 'react'
import { Archive } from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'
import { NoteGrid } from '@/components/NoteGrid'

export default function ArchivePage() {
  const { notes, loading, fetchNotes } = useNoteStore()

  useEffect(() => {
    fetchNotes({ archived: true })
  }, [fetchNotes])

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <Archive className="w-24 h-24 mb-4 stroke-1" />
          <p className="text-xl">Your archived notes appear here</p>
        </div>
      ) : (
        <NoteGrid notes={notes} />
      )}
    </div>
  )
}
