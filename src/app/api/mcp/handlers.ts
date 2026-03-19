import { prisma } from '@/lib/prisma'
import { McpError, INVALID_PARAMS, METHOD_NOT_FOUND } from './errors'

const noteInclude = {
  checklistItems: { orderBy: { position: 'asc' as const } },
  labels: { include: { label: true } },
}

function textResult(data: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

async function findNoteOrThrow(id: string) {
  const note = await prisma.note.findUnique({ where: { id }, include: noteInclude })
  if (!note) throw new McpError(INVALID_PARAMS, `Note not found: ${id}`)
  return note
}

export async function handleToolCall(name: string, args: Record<string, unknown> = {}) {
  switch (name) {
    case 'list_notes': {
      const where: any = {
        isArchived: args.archived === true,
        isTrashed: args.trashed === true,
      }
      if (args.labelId) {
        where.labels = { some: { labelId: args.labelId } }
      }
      if (args.search) {
        where.OR = [
          { title: { contains: args.search } },
          { content: { contains: args.search } },
        ]
      }
      const notes = await prisma.note.findMany({
        where,
        include: noteInclude,
        orderBy: [{ isPinned: 'desc' }, { position: 'asc' }, { updatedAt: 'desc' }],
      })
      return textResult(notes)
    }

    case 'get_note': {
      const note = await findNoteOrThrow(args.id as string)
      return textResult(note)
    }

    case 'create_note': {
      const maxPosition = await prisma.note.findFirst({
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      const note = await prisma.note.create({
        data: {
          title: (args.title as string) || '',
          content: (args.content as string) || '',
          type: (args.type as string) || 'note',
          color: (args.color as string) || 'default',
          isPinned: (args.isPinned as boolean) || false,
          position: (maxPosition?.position ?? 0) + 1,
          checklistItems: args.checklistItems
            ? {
                create: (args.checklistItems as any[]).map((item, index) => ({
                  text: item.text,
                  isChecked: item.isChecked || false,
                  position: index,
                })),
              }
            : undefined,
          labels: args.labelIds
            ? {
                create: (args.labelIds as string[]).map((labelId) => ({ labelId })),
              }
            : undefined,
        },
        include: noteInclude,
      })
      return textResult(note)
    }

    case 'update_note': {
      const id = args.id as string
      await findNoteOrThrow(id)

      const updateData: any = {}
      if (args.title !== undefined) updateData.title = args.title
      if (args.content !== undefined) updateData.content = args.content
      if (args.type !== undefined) updateData.type = args.type
      if (args.color !== undefined) updateData.color = args.color
      if (args.isPinned !== undefined) updateData.isPinned = args.isPinned

      if (args.checklistItems !== undefined) {
        await prisma.checklistItem.deleteMany({ where: { noteId: id } })
        const items = args.checklistItems as any[]
        if (items.length > 0) {
          await prisma.checklistItem.createMany({
            data: items.map((item, index) => ({
              text: item.text,
              isChecked: item.isChecked || false,
              position: index,
              noteId: id,
            })),
          })
        }
      }

      if (args.labelIds !== undefined) {
        await prisma.noteLabel.deleteMany({ where: { noteId: id } })
        const labelIds = args.labelIds as string[]
        if (labelIds.length > 0) {
          await prisma.noteLabel.createMany({
            data: labelIds.map((labelId) => ({ noteId: id, labelId })),
          })
        }
      }

      const note = await prisma.note.update({
        where: { id },
        data: updateData,
        include: noteInclude,
      })
      return textResult(note)
    }

    case 'delete_note': {
      const id = args.id as string
      try {
        await prisma.note.delete({ where: { id } })
      } catch (e: any) {
        if (e.code === 'P2025') throw new McpError(INVALID_PARAMS, `Note not found: ${id}`)
        throw e
      }
      return textResult({ deleted: true, id })
    }

    case 'archive_note': {
      const id = args.id as string
      await findNoteOrThrow(id)
      const note = await prisma.note.update({
        where: { id },
        data: { isArchived: args.archive as boolean },
        include: noteInclude,
      })
      return textResult(note)
    }

    case 'trash_note': {
      const id = args.id as string
      const trash = args.trash as boolean
      await findNoteOrThrow(id)
      const note = await prisma.note.update({
        where: { id },
        data: {
          isTrashed: trash,
          trashedAt: trash ? new Date() : null,
        },
        include: noteInclude,
      })
      return textResult(note)
    }

    case 'list_labels': {
      const labels = await prisma.label.findMany({ orderBy: { name: 'asc' } })
      return textResult(labels)
    }

    case 'create_label': {
      const name = args.name as string
      if (!name || name.trim() === '') {
        throw new McpError(INVALID_PARAMS, 'Label name is required')
      }
      const existing = await prisma.label.findUnique({ where: { name: name.trim() } })
      if (existing) {
        throw new McpError(INVALID_PARAMS, `Label already exists: ${name.trim()}`)
      }
      const label = await prisma.label.create({ data: { name: name.trim() } })
      return textResult(label)
    }

    case 'delete_label': {
      const id = args.id as string
      try {
        await prisma.label.delete({ where: { id } })
      } catch (e: any) {
        if (e.code === 'P2025') throw new McpError(INVALID_PARAMS, `Label not found: ${id}`)
        throw e
      }
      return textResult({ deleted: true, id })
    }

    default:
      throw new McpError(METHOD_NOT_FOUND, `Unknown tool: ${name}`)
  }
}
