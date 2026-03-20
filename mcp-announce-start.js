/**
 * Standalone sidecar script for Beacon discovery.
 * Runs alongside the Next.js server to announce open-keep's MCP tools.
 */

const { createDiscoveryResponder } = require('./mcp-announce.js');

createDiscoveryResponder({
  name: 'open-keep',
  description: 'Note-taking app — create, manage, and organize notes with labels and checklists',
  tools: [
    { name: 'list_notes', description: 'List notes with optional filters for archived, trashed, label, or search query', inputSchema: { type: 'object', properties: { archived: { type: 'boolean' }, trashed: { type: 'boolean' }, labelId: { type: 'string' }, search: { type: 'string' } } } },
    { name: 'get_note', description: 'Get a single note by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'create_note', description: 'Create a new note or checklist', inputSchema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, type: { type: 'string', enum: ['note', 'checklist'] }, color: { type: 'string' }, isPinned: { type: 'boolean' }, checklistItems: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, isChecked: { type: 'boolean' } }, required: ['text'] } }, labelIds: { type: 'array', items: { type: 'string' } } } } },
    { name: 'update_note', description: 'Update an existing note', inputSchema: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' }, type: { type: 'string', enum: ['note', 'checklist'] }, color: { type: 'string' }, isPinned: { type: 'boolean' }, checklistItems: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, isChecked: { type: 'boolean' } }, required: ['text'] } }, labelIds: { type: 'array', items: { type: 'string' } } }, required: ['id'] } },
    { name: 'delete_note', description: 'Permanently delete a note', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'archive_note', description: 'Archive or unarchive a note', inputSchema: { type: 'object', properties: { id: { type: 'string' }, archive: { type: 'boolean' } }, required: ['id', 'archive'] } },
    { name: 'trash_note', description: 'Move a note to trash or restore it', inputSchema: { type: 'object', properties: { id: { type: 'string' }, trash: { type: 'boolean' } }, required: ['id', 'trash'] } },
    { name: 'list_labels', description: 'List all labels', inputSchema: { type: 'object', properties: {} } },
    { name: 'create_label', description: 'Create a new label', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
    { name: 'delete_label', description: 'Delete a label', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  ],
  port: parseInt(process.env.MCP_PORT || '9847'),
  path: '/api/mcp',
  listenPort: parseInt(process.env.DISCOVERY_PORT || '9099'),
});

console.log('open-keep discovery sidecar started');
