# OpenKeep

A self-hosted note-taking app inspired by Google Keep, built with Next.js 14, Prisma (SQLite), Zustand, and Tailwind CSS.

## Local Development with Docker

The `docker-compose.yml` is configured for local development with hot reload:

```bash
docker compose up -d      # Start the dev server (port 9847)
docker compose logs -f     # Follow logs
docker compose down        # Stop
```

The container mounts your source code so changes are reflected immediately via Next.js hot reload. SQLite data persists in a Docker volume.

## Local Development without Docker

```bash
pnpm install
npx prisma migrate dev
pnpm dev
```

The dev server runs at http://openkeep:9847.

## Production Deployment

Build the production image:

```bash
docker build -t openkeep .
```

Example `docker-compose.prod.yml`:

```yaml
services:
  openkeep:
    image: openkeep
    user: "1000:1000"
    ports:
      - "9847:9847"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

The `user:` directive runs the container as the specified UID:GID. Ensure the
host data directory is writable by that user:

```bash
mkdir -p ./data && chown 1000:1000 ./data
```

If you omit `user:`, the container runs as root, which also works but is less
secure.

## MCP Integration

OpenKeep exposes an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) endpoint at `/api/mcp`, allowing AI agents to manage notes and labels via JSON-RPC 2.0.

### Available Tools

| Tool | Description |
|------|-------------|
| `list_notes` | List notes with optional filters (archived, trashed, labelId, search) |
| `get_note` | Get a single note by ID |
| `create_note` | Create a new note or checklist |
| `update_note` | Update an existing note |
| `delete_note` | Permanently delete a note |
| `archive_note` | Archive or unarchive a note |
| `trash_note` | Move a note to trash or restore it |
| `list_labels` | List all labels |
| `create_label` | Create a new label |
| `delete_label` | Delete a label |

### Register with Claude Code

```bash
# Per-project
claude mcp add -t http open-keep http://openkeep:9847/api/mcp

# Global (all projects)
claude mcp add -s user -t http open-keep http://openkeep:9847/api/mcp
```
