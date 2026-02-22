import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const labels = await prisma.label.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(labels)
  } catch (error) {
    console.error('Failed to fetch labels:', error)
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const existingLabel = await prisma.label.findUnique({
      where: { name: name.trim() },
    })

    if (existingLabel) {
      return NextResponse.json({ error: 'Label already exists' }, { status: 409 })
    }

    const label = await prisma.label.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(label, { status: 201 })
  } catch (error) {
    console.error('Failed to create label:', error)
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 })
  }
}
