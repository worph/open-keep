import JSZip from 'jszip'

interface KeepNoteJSON {
  title?: string
  textContent?: string
  listContent?: { text: string; isChecked: boolean }[]
  color?: string
  isPinned?: boolean
  isArchived?: boolean
  isTrashed?: boolean
  annotations?: { title?: string; url?: string; description?: string; source?: string }[]
  createdTimestampUsec?: number
  userEditedTimestampUsec?: number
}

export interface ImportedNote {
  title: string
  content: string
  type: 'note' | 'checklist'
  color: string
  isPinned: boolean
  isArchived: boolean
  isTrashed: boolean
  trashedAt: string | null
  position: number
  createdAt: string
  updatedAt: string
  checklistItems: { text: string; isChecked: boolean; position: number }[]
}

const COLOR_MAP: Record<string, string> = {
  DEFAULT: 'default',
  RED: 'red',
  ORANGE: 'orange',
  YELLOW: 'yellow',
  GREEN: 'green',
  TEAL: 'teal',
  BROWN: 'brown',
  PINK: 'pink',
  GRAY: 'gray',
  CERULEAN: 'blue',
}

function usecToISO(usec: number | undefined): string {
  if (!usec) return new Date().toISOString()
  return new Date(usec / 1000).toISOString()
}

function mapKeepNote(raw: KeepNoteJSON): ImportedNote {
  const isChecklist = Array.isArray(raw.listContent) && raw.listContent.length > 0
  const color = COLOR_MAP[raw.color || 'DEFAULT'] || 'default'

  let content = raw.textContent || ''

  if (raw.annotations && raw.annotations.length > 0) {
    const links = raw.annotations
      .filter((a) => a.url)
      .map((a) => (a.title ? `- [${a.title}](${a.url})` : `- ${a.url}`))
    if (links.length > 0) {
      content = content ? `${content}\n\n---\nLinks:\n${links.join('\n')}` : `Links:\n${links.join('\n')}`
    }
  }

  const checklistItems = isChecklist
    ? raw.listContent!.map((item, i) => ({
        text: item.text,
        isChecked: item.isChecked,
        position: i,
      }))
    : []

  const isTrashed = raw.isTrashed || false
  const editedUsec = raw.userEditedTimestampUsec || Date.now() * 1000

  return {
    title: raw.title || '',
    content: isChecklist ? '' : content,
    type: isChecklist ? 'checklist' : 'note',
    color,
    isPinned: raw.isPinned || false,
    isArchived: raw.isArchived || false,
    isTrashed,
    trashedAt: isTrashed ? usecToISO(raw.userEditedTimestampUsec) : null,
    position: 0, // assigned after sorting
    createdAt: usecToISO(raw.createdTimestampUsec),
    updatedAt: usecToISO(raw.userEditedTimestampUsec),
    checklistItems,
  }
}

export async function parseKeepZip(file: File): Promise<ImportedNote[]> {
  const zip = await JSZip.loadAsync(file)
  const notes: ImportedNote[] = []

  const jsonFiles = Object.keys(zip.files).filter(
    (path) => path.endsWith('.json') && path.includes('Keep/')
  )

  for (const path of jsonFiles) {
    try {
      const text = await zip.files[path].async('text')
      const raw: KeepNoteJSON = JSON.parse(text)
      const note = mapKeepNote(raw)

      // Skip blank notes
      if (!note.title && !note.content && note.checklistItems.length === 0) {
        continue
      }

      notes.push(note)
    } catch {
      // Skip files that fail to parse
      continue
    }
  }

  // Sort by edited timestamp descending (most recent first), assign positions
  notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  notes.forEach((note, i) => {
    note.position = i
  })

  return notes
}
