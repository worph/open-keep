# OpenKeep - Specification Document

A simple, open-source Google Keep alternative for personal note management.

---

## 1. Overview

**OpenKeep** is a self-hosted, single-user note-taking application that replicates the core functionality and layout of Google Keep. It provides a fast, intuitive interface for capturing and organizing notes and checklists.

### Goals
- Simple, distraction-free note-taking
- Familiar Google Keep-style masonry grid layout
- Self-hosted and privacy-focused
- Lightweight and fast

### Non-Goals
- Multi-user/collaboration features
- Real-time sync across devices (out of initial scope)
- Mobile native apps (web-responsive only)

---

## 2. Core Features

### 2.1 Notes

| Feature | Description |
|---------|-------------|
| Create note | Quick-add input at top + FAB button |
| Title | Optional note title (text, max 200 chars) |
| Content | Note body (text, max 10,000 chars) |
| Color | 12 background color options |
| Pin | Pin notes to top of the grid |
| Archive | Move notes to archive (hidden from main view) |
| Delete | Move to trash (auto-delete after 7 days) |
| Copy | Duplicate a note |

### 2.2 Checklists

| Feature | Description |
|---------|-------------|
| Checkbox items | Add multiple checkbox items to a note |
| Check/uncheck | Toggle item completion |
| Reorder items | Drag and drop to reorder |
| Hide completed | Option to collapse checked items |
| Convert | Toggle between text note and checklist |

### 2.3 Labels

| Feature | Description |
|---------|-------------|
| Create label | Create named labels for organization |
| Assign labels | Add one or more labels to a note |
| Filter by label | View all notes with a specific label |
| Edit label | Rename existing labels |
| Delete label | Remove label (unassigns from all notes) |

### 2.4 Search

| Feature | Description |
|---------|-------------|
| Full-text search | Search across titles and content |
| Filter by color | Filter notes by background color |
| Filter by type | Notes, Checklists |
| Filter by label | Combine with label filtering |

---

## 3. User Interface Layout

### 3.1 Overall Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  [☰] [Logo] [━━━━━━ Search Bar ━━━━━━] [Grid/List] [⚙] [🌙]    │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│  SIDEBAR   │  MAIN CONTENT AREA                                 │
│            │                                                    │
│  • Notes   │  ┌─────────────────────────────────────────────┐   │
│  ─────────│  │  Take a note...              [✓] [🎨] [📌]  │   │
│  Labels    │  └─────────────────────────────────────────────┘   │
│            │                                                    │
│  • Work    │   PINNED                                           │
│  • Personal│  ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  • Ideas   │  │ Note 1  │ │ Note 2  │ │ Note 3  │              │
│  ─────────│  └─────────┘ └─────────┘ └─────────┘              │
│  • Edit    │                                                    │
│  ─────────│   OTHERS                                           │
│  • Archive │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  • Trash   │  │ Note 4  │ │ Note 5  │ │ Note 6  │ │ Note 7  │  │
│            │  │         │ └─────────┘ └─────────┘ │         │  │
│            │  │         │ ┌─────────┐ ┌─────────┐ └─────────┘  │
│            │  └─────────┘ │ Note 8  │ │ Note 9  │              │
│            │              └─────────┘ └─────────┘              │
└────────────┴────────────────────────────────────────────────────┘
```

### 3.2 Header Components

| Component | Description |
|-----------|-------------|
| Hamburger menu | Toggle sidebar collapse |
| Logo/Title | App branding, click to go home |
| Search bar | Expandable search input with filters |
| View toggle | Switch between grid and list view |
| Settings | App settings dropdown |
| Theme toggle | Light/dark mode switch |

### 3.3 Sidebar Navigation

| Section | Items |
|---------|-------|
| Primary | Notes |
| Labels | Dynamic list of user labels + "Edit labels" |
| Secondary | Archive, Trash |

### 3.4 Note Card Components

```
┌──────────────────────────────────┐
│ 📌                          [...] │  ← Pin icon + overflow menu
├──────────────────────────────────┤
│ Note Title                        │  ← Optional title
├──────────────────────────────────┤
│ Note content preview text here    │  ← Content (truncated)
│ that can span multiple lines...   │
├──────────────────────────────────┤
│ [Label1] [Label2]                 │  ← Labels chips
├──────────────────────────────────┤
│ [🎨] [📁] [...]                   │  ← Action bar (on hover)
└──────────────────────────────────┘
```

### 3.5 Note Card Actions (Hover Toolbar)

| Icon | Action |
|------|--------|
| 🎨 | Change background color |
| 📁 | Archive note |
| ⋮ | More options (delete, copy, labels) |

---

## 4. Color Palette

### 4.1 Note Colors (12 options)

| Name | Light Mode | Dark Mode |
|------|------------|-----------|
| Default | `#FFFFFF` | `#202124` |
| Coral | `#FAAFA8` | `#77172E` |
| Peach | `#F39F76` | `#692B17` |
| Sand | `#FFF8B8` | `#7C4A03` |
| Mint | `#E2F6D3` | `#264D3B` |
| Sage | `#B4DDD3` | `#0C625D` |
| Fog | `#D4E4ED` | `#256377` |
| Storm | `#AECCDC` | `#284255` |
| Dusk | `#D3BFDB` | `#472E5B` |
| Blossom | `#F6E2DD` | `#6C394F` |
| Clay | `#E9E3D4` | `#4B443A` |
| Chalk | `#EFEFF1` | `#232427` |

---

## 5. Data Models

### 5.1 Note

```typescript
interface Note {
  id: string;              // UUID
  title: string;           // Optional, max 200 chars
  content: string;         // Max 10,000 chars
  type: 'note' | 'checklist';
  color: NoteColor;        // Enum of 12 colors
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt: Date | null;  // For auto-delete after 7 days
  labels: string[];        // Array of label IDs
  checklistItems: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  position: number;        // For manual ordering
}
```

### 5.2 ChecklistItem

```typescript
interface ChecklistItem {
  id: string;
  text: string;            // Max 1,000 chars
  isChecked: boolean;
  position: number;        // For ordering within note
}
```

### 5.3 Label

```typescript
interface Label {
  id: string;
  name: string;            // Max 50 chars, unique
  createdAt: Date;
}
```

---

## 6. Views & Routes

| Route | View | Description |
|-------|------|-------------|
| `/` | Home | All active notes (not archived/trashed) |
| `/label/:id` | Label | Notes filtered by specific label |
| `/archive` | Archive | Archived notes |
| `/trash` | Trash | Trashed notes (7-day retention) |
| `/search` | Search | Search results view |

---

## 7. Interactions

### 7.1 Note Creation
1. Click on "Take a note..." input area
2. Input expands to show title field and toolbar
3. Type title (optional) and content
4. Click outside or press Escape to save
5. Empty notes are discarded

### 7.2 Note Editing
1. Click on any note card to open expanded editor
2. Modal/overlay displays full note
3. All fields are editable inline
4. Changes auto-save on blur or after 2s of inactivity
5. Click outside or X to close

### 7.3 Drag and Drop
- Notes can be reordered via drag and drop
- Visual placeholder shows drop position
- Order persists across sessions

### 7.4 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `C` | Create new note |
| `L` | Create new checklist |
| `/` | Focus search |
| `Esc` | Close editor / Clear search |
| `E` | Edit selected note |
| `#` | Open label picker |
| `Delete` | Move to trash |

---

## 8. Technical Stack (Recommended)

### Frontend
- **Framework**: React 18+ or Vue 3+
- **State**: Zustand or Pinia
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit or vue-draggable
- **Icons**: Lucide Icons

### Backend
- **Runtime**: Node.js with Express or Fastify
- **Database**: SQLite (simple) or PostgreSQL
- **ORM**: Prisma or Drizzle

### Alternative: Full-Stack
- **Next.js** or **Nuxt.js** for SSR/SSG
- **SQLite** with file-based storage for simplicity

---

## 9. API Endpoints

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List all notes (with filters) |
| POST | `/api/notes` | Create a note |
| GET | `/api/notes/:id` | Get single note |
| PATCH | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Permanently delete |
| POST | `/api/notes/:id/archive` | Archive a note |
| POST | `/api/notes/:id/unarchive` | Restore from archive |
| POST | `/api/notes/:id/trash` | Move to trash |
| POST | `/api/notes/:id/restore` | Restore from trash |

### Labels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/labels` | List all labels |
| POST | `/api/labels` | Create a label |
| PATCH | `/api/labels/:id` | Update label name |
| DELETE | `/api/labels/:id` | Delete a label |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=` | Search notes |

---

## 10. Settings

| Setting | Options | Default |
|---------|---------|---------|
| Theme | Light / Dark / System | System |
| Default view | Grid / List | Grid |
| New note position | Top / Bottom | Top |
| Trash auto-delete | 7 / 14 / 30 days | 7 days |

---

## 11. Future Considerations (Out of Scope v1)

- Reminders (date/time notifications)
- Image attachments
- Drawing/handwriting
- Voice notes
- Collaboration/sharing
- Export (JSON, Markdown)
- Import from Google Keep
- Mobile apps (PWA first)
- Browser extension
- Sync across devices

---

## 12. File Structure (Suggested)

```
open-keep/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── NoteCard/
│   │   ├── NoteEditor/
│   │   ├── NoteGrid/
│   │   ├── ColorPicker/
│   │   ├── LabelPicker/
│   │   └── SearchBar/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Archive/
│   │   ├── Trash/
│   │   └── Label/
│   ├── stores/
│   │   ├── noteStore.ts
│   │   ├── labelStore.ts
│   │   └── uiStore.ts
│   ├── api/
│   │   ├── notes.ts
│   │   ├── labels.ts
│   │   └── search.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── styles/
│       └── globals.css
├── server/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── db/
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## 13. Success Metrics

- Page load time < 1s
- Note save latency < 100ms
- Supports 10,000+ notes without performance degradation
- Lighthouse score > 90 on all categories
- Works offline (PWA)

---

*Version: 1.0*
*Last Updated: 2026-02-08*
