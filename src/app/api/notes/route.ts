import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const archived = searchParams.get('archived') === 'true'
  const trashed = searchParams.get('trashed') === 'true'
  const labelId = searchParams.get('labelId')
  const query = searchParams.get('q')

  try {
    const where: any = {
      isArchived: archived,
      isTrashed: trashed,
    }

    if (labelId) {
      where.labels = {
        some: { labelId },
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { content: { contains: query } },
      ]
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        checklistItems: {
          orderBy: { position: 'asc' },
        },
        labels: {
          include: { label: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { position: 'asc' },
        { updatedAt: 'desc' },
      ],
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, type, color, isPinned, checklistItems, labelIds } = body

    const maxPosition = await prisma.note.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const note = await prisma.note.create({
      data: {
        title: title || '',
        content: content || '',
        type: type || 'note',
        color: color || 'default',
        isPinned: isPinned || false,
        position: (maxPosition?.position ?? 0) + 1,
        checklistItems: checklistItems
          ? {
              create: checklistItems.map((item: any, index: number) => ({
                text: item.text,
                isChecked: item.isChecked || false,
                position: index,
              })),
            }
          : undefined,
        labels: labelIds
          ? {
              create: labelIds.map((labelId: string) => ({
                labelId,
              })),
            }
          : undefined,
      },
      include: {
        checklistItems: {
          orderBy: { position: 'asc' },
        },
        labels: {
          include: { label: true },
        },
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { noteIds } = body

    if (!Array.isArray(noteIds)) {
      return NextResponse.json({ error: 'noteIds must be an array' }, { status: 400 })
    }

    await prisma.$transaction(
      noteIds.map((id, index) =>
        prisma.note.update({
          where: { id },
          data: { position: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to reorder notes:', error)
    return NextResponse.json({ error: 'Failed to reorder notes' }, { status: 500 })
  }
}
