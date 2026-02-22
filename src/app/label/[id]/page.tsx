'use client'

import { useEffect } from 'react'
import { Tag } from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'
import { useLabelStore } from '@/stores/labelStore'
import { NoteInput } from '@/components/NoteInput'
import { NoteGrid } from '@/components/NoteGrid'

interface LabelPageProps {
  params: { id: string }
}

export default function LabelPage({ params }: LabelPageProps) {
  const { notes, loading, fetchNotes } = useNoteStore()
  const { labels } = useLabelStore()

  const label = labels.find((l) => l.id === params.id)

  useEffect(() => {
    fetchNotes({ labelId: params.id })
  }, [fetchNotes, params.id])

  return (
    <div>
      <NoteInput />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <Tag className="w-24 h-24 mb-4 stroke-1" />
          <p className="text-xl">
            No notes with label &quot;{label?.name || 'Unknown'}&quot;
          </p>
        </div>
      ) : (
        <NoteGrid notes={notes} />
      )}
    </div>
  )
}
