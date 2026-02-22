import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '@/test/mocks/prisma'
import { GET, POST, PUT } from '../route'

describe('GET /api/notes', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('returns notes array', async () => {
    const mockNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1', checklistItems: [], labels: [] },
      { id: '2', title: 'Note 2', content: 'Content 2', checklistItems: [], labels: [] },
    ]
    mockPrisma.note.findMany.mockResolvedValue(mockNotes)

    const request = new NextRequest('http://localhost/api/notes')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockNotes)
    expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isArchived: false, isTrashed: false },
      })
    )
  })

  it('filters by archived=true', async () => {
    mockPrisma.note.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/notes?archived=true')
    await GET(request)

    expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isArchived: true }),
      })
    )
  })

  it('filters by trashed=true', async () => {
    mockPrisma.note.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/notes?trashed=true')
    await GET(request)

    expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isTrashed: true }),
      })
    )
  })

  it('filters by labelId', async () => {
    mockPrisma.note.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/notes?labelId=label-123')
    await GET(request)

    expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          labels: { some: { labelId: 'label-123' } },
        }),
      })
    )
  })

  it('filters by search query', async () => {
    mockPrisma.note.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/notes?q=test')
    await GET(request)

    expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'test' } },
            { content: { contains: 'test' } },
          ],
        }),
      })
    )
  })
})

describe('POST /api/notes', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('creates note with correct data', async () => {
    const mockNote = {
      id: 'new-note',
      title: 'Test Note',
      content: 'Test content',
      type: 'note',
      color: 'blue',
      isPinned: false,
      position: 1,
      checklistItems: [],
      labels: [],
    }
    mockPrisma.note.findFirst.mockResolvedValue({ position: 0 })
    mockPrisma.note.create.mockResolvedValue(mockNote)

    const request = new NextRequest('http://localhost/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Note',
        content: 'Test content',
        color: 'blue',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(mockNote)
    expect(mockPrisma.note.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Test Note',
          content: 'Test content',
          color: 'blue',
        }),
      })
    )
  })
})

describe('PUT /api/notes', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('reorders notes with valid noteIds array', async () => {
    const noteIds = ['note-1', 'note-2', 'note-3']
    mockPrisma.$transaction.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/notes', {
      method: 'PUT',
      body: JSON.stringify({ noteIds }),
    })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
  })

  it('returns 400 for invalid noteIds', async () => {
    const request = new NextRequest('http://localhost/api/notes', {
      method: 'PUT',
      body: JSON.stringify({ noteIds: 'not-an-array' }),
    })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('noteIds must be an array')
  })
})
