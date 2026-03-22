# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenKeep is a self-hosted note-taking app inspired by Google Keep, built with Next.js 14, Prisma (SQLite), Zustand, and Tailwind CSS. It supports notes, checklists, labels, colors, drag-and-drop reordering, archive/trash, and dark mode.

## Development

Development always uses the Docker dev stack — never run `pnpm dev` directly on the host.

```bash
# First time only (once per machine):
docker network create mcp-net     # Create shared MCP discovery network

# Development:
docker compose up -d              # Start dev container (http://openkeep:9847)
docker compose logs -f            # Follow logs
docker compose restart            # Restart after config changes
docker compose down               # Stop
docker compose up -d --build      # Rebuild after dependency changes
```

Source files are volume-mounted, so code changes hot-reload automatically. If the UI breaks (e.g. unstyled page), clear the Next.js cache and restart:
```bash
rm -rf .next && docker compose restart
```

### Tests & Linting (run on host)

```bash
pnpm test                 # Run all tests once (vitest run)
pnpm test:watch           # Watch mode
pnpm test:ui              # Browser-based test UI
pnpm test:coverage        # Coverage report (v8 provider)
pnpm lint                 # ESLint
```

Run a single test file:
```bash
pnpm vitest run src/stores/__tests__/noteStore.test.ts
```

### Database

```bash
# These run inside the container automatically on startup.
# To run manually on the host:
npx prisma migrate dev    # Apply migrations in development
npx prisma generate       # Regenerate Prisma client
npx prisma studio         # Visual database browser
```

## MCP Server

OpenKeep exposes a built-in [Model Context Protocol](https://modelcontextprotocol.io) server at `/api/mcp` (Streamable HTTP transport). It provides tools for full note and label CRUD:

- `list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`
- `archive_note`, `trash_note`
- `list_labels`, `create_label`, `delete_label`

Source: `src/app/api/mcp/` (route.ts, tools.ts, handlers.ts, errors.ts)

## Architecture

**Data flow:** Component → Zustand store action → `fetch()` to API route → Prisma query → SQLite → response → store state update → re-render.

### API Routes (`src/app/api/`)

- `notes/route.ts` — GET (list with filters: archived, trashed, labelId, search), POST (create), PUT (batch reorder)
- `notes/[id]/route.ts` — GET, PATCH, DELETE
- `labels/route.ts` — GET (list), POST (create)
- `labels/[id]/route.ts` — PATCH, DELETE
- `mcp/route.ts` — GET (SSE session), POST (JSON-RPC) — MCP server endpoint

### State Management (`src/stores/`)

Three Zustand stores:
- **noteStore** — note CRUD, search query, reordering
- **labelStore** — label CRUD
- **uiStore** — sidebar, dark mode, grid/list view (persisted to localStorage)

### Database (`prisma/schema.prisma`)

SQLite with four models: **Note**, **ChecklistItem**, **Label**, **NoteLabel** (junction table). Notes use soft delete via `isTrashed`/`trashedAt` fields. UUID primary keys. Position field enables drag-and-drop ordering.

### Key Files

- `src/lib/prisma.ts` — singleton Prisma client (avoids hot-reload connection exhaustion)
- `src/lib/utils.ts` — `cn()` classname helper, `noteColors` array (12 colors)
- `src/types/index.ts` — shared TypeScript interfaces
- `src/test/setup.ts` — mocks `next/navigation` for tests
- `src/test/mocks/prisma.ts` — mock Prisma client for unit tests

## Testing

Tests use Vitest with jsdom environment and `globals: true` (no need to import `describe`/`it`/`expect`). API and store tests mock Prisma via `src/test/mocks/prisma.ts`. Component tests use React Testing Library. Next.js navigation hooks are mocked in the setup file.

Path alias `@/*` maps to `src/*` in both tsconfig and vitest config.

## Docker

- **Dev**: `docker compose up -d` mounts source and runs `pnpm dev` on port 9847. Hot-reload enabled.
- **Production**: Multi-stage Dockerfile produces a standalone Next.js build. The container runs Prisma migrations on startup, then serves on port 9847. SQLite database lives at `/app/data/openkeep.db`, persisted via a Docker volume.
