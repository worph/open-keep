export const MCP_TOOLS = [
  {
    name: 'list_notes',
    description: 'List notes with optional filters for archived, trashed, label, or search query',
    inputSchema: {
      type: 'object',
      properties: {
        archived: { type: 'boolean', description: 'Filter archived notes (default: false)' },
        trashed: { type: 'boolean', description: 'Filter trashed notes (default: false)' },
        labelId: { type: 'string', description: 'Filter by label ID' },
        search: { type: 'string', description: 'Search in title and content' },
      },
    },
  },
  {
    name: 'get_note',
    description: 'Get a single note by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Note ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_note',
    description: 'Create a new note or checklist',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Note title' },
        content: { type: 'string', description: 'Note content' },
        type: { type: 'string', enum: ['note', 'checklist'], description: 'Note type (default: note)' },
        color: { type: 'string', description: 'Note color (default: default)' },
        isPinned: { type: 'boolean', description: 'Pin the note (default: false)' },
        checklistItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              isChecked: { type: 'boolean' },
            },
            required: ['text'],
          },
          description: 'Checklist items (for checklist type)',
        },
        labelIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Label IDs to attach',
        },
      },
    },
  },
  {
    name: 'update_note',
    description: 'Update an existing note',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Note ID' },
        title: { type: 'string', description: 'Note title' },
        content: { type: 'string', description: 'Note content' },
        type: { type: 'string', enum: ['note', 'checklist'], description: 'Note type' },
        color: { type: 'string', description: 'Note color' },
        isPinned: { type: 'boolean', description: 'Pin the note' },
        checklistItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              isChecked: { type: 'boolean' },
            },
            required: ['text'],
          },
          description: 'Replace checklist items',
        },
        labelIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Replace label IDs',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_note',
    description: 'Permanently delete a note',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Note ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'archive_note',
    description: 'Archive or unarchive a note',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Note ID' },
        archive: { type: 'boolean', description: 'true to archive, false to unarchive' },
      },
      required: ['id', 'archive'],
    },
  },
  {
    name: 'trash_note',
    description: 'Move a note to trash or restore it',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Note ID' },
        trash: { type: 'boolean', description: 'true to trash, false to restore' },
      },
      required: ['id', 'trash'],
    },
  },
  {
    name: 'list_labels',
    description: 'List all labels',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_label',
    description: 'Create a new label',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Label name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'delete_label',
    description: 'Delete a label',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Label ID' },
      },
      required: ['id'],
    },
  },
]
