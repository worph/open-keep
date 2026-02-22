export interface ChecklistItem {
  id: string
  text: string
  isChecked: boolean
  position: number
  noteId: string
}

export interface Label {
  id: string
  name: string
  createdAt: Date
}

export interface NoteLabel {
  noteId: string
  labelId: string
  label: Label
}

export interface Note {
  id: string
  title: string
  content: string
  type: 'note' | 'checklist'
  color: string
  isPinned: boolean
  isArchived: boolean
  isTrashed: boolean
  trashedAt: Date | null
  position: number
  createdAt: Date
  updatedAt: Date
  checklistItems: ChecklistItem[]
  labels: NoteLabel[]
}

export interface CreateNoteInput {
  title?: string
  content?: string
  type?: 'note' | 'checklist'
  color?: string
  isPinned?: boolean
  checklistItems?: { text: string; isChecked?: boolean }[]
  labelIds?: string[]
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  isArchived?: boolean
  isTrashed?: boolean
  position?: number
}
