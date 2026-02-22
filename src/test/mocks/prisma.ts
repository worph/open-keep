import { vi } from 'vitest'

export const mockPrisma = {
  note: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  label: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  checklistItem: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  noteLabel: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn((callbacks) => Promise.all(callbacks)),
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

export function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          ;(method as ReturnType<typeof vi.fn>).mockReset()
        }
      })
    }
  })
  mockPrisma.$transaction.mockImplementation((callbacks) => Promise.all(callbacks))
}
