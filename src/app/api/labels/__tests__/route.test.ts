import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '@/test/mocks/prisma'
import { GET, POST } from '../route'

describe('GET /api/labels', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('returns labels array', async () => {
    const mockLabels = [
      { id: '1', name: 'Work', createdAt: new Date() },
      { id: '2', name: 'Personal', createdAt: new Date() },
    ]
    mockPrisma.label.findMany.mockResolvedValue(mockLabels)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0]).toMatchObject({ id: '1', name: 'Work' })
    expect(data[1]).toMatchObject({ id: '2', name: 'Personal' })
    expect(mockPrisma.label.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })
})

describe('POST /api/labels', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('creates label with valid name', async () => {
    const mockLabel = { id: 'new-label', name: 'New Label', createdAt: new Date() }
    mockPrisma.label.findUnique.mockResolvedValue(null)
    mockPrisma.label.create.mockResolvedValue(mockLabel)

    const request = new NextRequest('http://localhost/api/labels', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Label' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({ id: 'new-label', name: 'New Label' })
    expect(mockPrisma.label.create).toHaveBeenCalledWith({
      data: { name: 'New Label' },
    })
  })

  it('returns 409 for duplicate label', async () => {
    const existingLabel = { id: 'existing', name: 'Existing', createdAt: new Date() }
    mockPrisma.label.findUnique.mockResolvedValue(existingLabel)

    const request = new NextRequest('http://localhost/api/labels', {
      method: 'POST',
      body: JSON.stringify({ name: 'Existing' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Label already exists')
  })

  it('returns 400 for empty name', async () => {
    const request = new NextRequest('http://localhost/api/labels', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required')
  })
})
