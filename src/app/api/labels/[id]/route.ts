import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const existingLabel = await prisma.label.findFirst({
      where: {
        name: name.trim(),
        NOT: { id: params.id },
      },
    })

    if (existingLabel) {
      return NextResponse.json({ error: 'Label already exists' }, { status: 409 })
    }

    const label = await prisma.label.update({
      where: { id: params.id },
      data: { name: name.trim() },
    })

    return NextResponse.json(label)
  } catch (error) {
    console.error('Failed to update label:', error)
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.label.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete label:', error)
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 })
  }
}
