'use client'

import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'
import { NoteGrid } from '@/components/NoteGrid'

export default function TrashPage() {
  const { notes, loading, fetchNotes } = useNoteStore()

  useEffect(() => {
    fetchNotes({ trashed: true })
  }, [fetchNotes])

  return (
    <div>
      {notes.length > 0 && (
        <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
          Notes in Trash are deleted after 7 days.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <Trash2 className="w-24 h-24 mb-4 stroke-1" />
          <p className="text-xl">No notes in Trash</p>
        </div>
      ) : (
        <NoteGrid notes={notes} />
      )}
    </div>
  )
}
