import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        checklistItems: {
          orderBy: { position: 'asc' },
        },
        labels: {
          include: { label: true },
        },
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to fetch note:', error)
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      type,
      color,
      isPinned,
      isArchived,
      isTrashed,
      position,
      checklistItems,
      labelIds,
    } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (type !== undefined) updateData.type = type
    if (color !== undefined) updateData.color = color
    if (isPinned !== undefined) updateData.isPinned = isPinned
    if (isArchived !== undefined) updateData.isArchived = isArchived
    if (position !== undefined) updateData.position = position

    if (isTrashed !== undefined) {
      updateData.isTrashed = isTrashed
      updateData.trashedAt = isTrashed ? new Date() : null
    }

    if (checklistItems !== undefined) {
      await prisma.checklistItem.deleteMany({
        where: { noteId: params.id },
      })

      if (checklistItems.length > 0) {
        await prisma.checklistItem.createMany({
          data: checklistItems.map((item: any, index: number) => ({
            id: item.id || undefined,
            text: item.text,
            isChecked: item.isChecked || false,
            position: index,
            noteId: params.id,
          })),
        })
      }
    }

    if (labelIds !== undefined) {
      await prisma.noteLabel.deleteMany({
        where: { noteId: params.id },
      })

      if (labelIds.length > 0) {
        await prisma.noteLabel.createMany({
          data: labelIds.map((labelId: string) => ({
            noteId: params.id,
            labelId,
          })),
        })
      }
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: updateData,
      include: {
        checklistItems: {
          orderBy: { position: 'asc' },
        },
        labels: {
          include: { label: true },
        },
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.note.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
