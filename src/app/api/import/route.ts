import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ImportedNote } from '@/lib/importKeep'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notes } = body as { notes: ImportedNote[] }

    if (!Array.isArray(notes)) {
      return NextResponse.json({ error: 'Invalid payload: notes must be an array' }, { status: 400 })
    }

    await prisma.$transaction([
      // Wipe all existing data (cascade handles ChecklistItem + NoteLabel)
      prisma.note.deleteMany(),
      prisma.label.deleteMany(),
      // Insert all imported notes with their checklist items
      ...notes.map((note) =>
        prisma.note.create({
          data: {
            title: note.title,
            content: note.content,
            type: note.type,
            color: note.color,
            isPinned: note.isPinned,
            isArchived: note.isArchived,
            isTrashed: note.isTrashed,
            trashedAt: note.trashedAt ? new Date(note.trashedAt) : null,
            position: note.position,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            checklistItems:
              note.checklistItems.length > 0
                ? {
                    create: note.checklistItems.map((item) => ({
                      text: item.text,
                      isChecked: item.isChecked,
                      position: item.position,
                    })),
                  }
                : undefined,
          },
        })
      ),
    ])

    return NextResponse.json({ success: true, count: notes.length })
  } catch (error) {
    console.error('Failed to import notes:', error)
    return NextResponse.json({ error: 'Failed to import notes' }, { status: 500 })
  }
}
