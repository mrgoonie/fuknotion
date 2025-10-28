# Fuknotion Codebase Summary

**Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Phase 0 Complete

---

## Overview

Fuknotion is a Notion-like note-taking desktop application built with Wails v2, combining Go backend with React TypeScript frontend. Current status: Phase 0 complete with database foundation and basic project structure.

## Directory Structure

```
fuknotion/
├── backend/                  # Go backend services
│   ├── database/            # SQLite operations
│   │   ├── database.go      # DB initialization, migrations
│   │   ├── notes.go         # Note CRUD operations
│   │   └── workspaces.go    # Workspace management
│   ├── models/              # Data models
│   │   └── types.go         # Go structs (Note, Workspace, Member, SyncStatus)
│   ├── sync/                # Google Drive sync (placeholder)
│   └── markdown/            # Markdown parser (placeholder)
├── frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx          # Main app component (Wails template)
│   │   ├── main.tsx         # React entry point
│   │   ├── index.css        # Global styles with Tailwind
│   │   └── assets/          # Static assets
│   ├── wailsjs/             # Auto-generated Wails bindings
│   │   ├── go/main/App.d.ts # TypeScript definitions for Go methods
│   │   └── runtime/         # Wails runtime types
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite build config
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── tsconfig.json        # TypeScript config
├── docs/                    # Documentation
│   ├── design-guidelines.md # Complete design system
│   └── ...                  # Other docs
├── plans/                   # Implementation plans
│   └── 251028-implementation-plan.md
├── app.go                   # Wails app bindings
├── main.go                  # Go entry point
├── go.mod                   # Go dependencies
├── wails.json               # Wails configuration
└── README.md                # Project overview
```

## Backend Architecture

### Core Components

#### 1. Database Layer (`backend/database/`)

**database.go** - Database initialization and migrations
- `NewDB(dataDir string)` - Creates SQLite database at `~/.fuknotion/fuknotion.db`
- WAL mode enabled for concurrent reads
- Schema migrations with indexes
- Tables: workspaces, notes, members, sync_status

**notes.go** - Note CRUD operations
- `CreateNote(workspaceID, title, content, parentID)` - Creates note with UUID
- `GetNote(id)` - Retrieves single note
- `ListNotes(workspaceID)` - Lists all non-deleted notes
- `UpdateNote(id, title, content)` - Updates note
- `DeleteNote(id)` - Soft delete (sets is_deleted flag)
- `ToggleFavorite(id)` - Toggles favorite status

**workspaces.go** - Workspace management
- `CreateWorkspace(name)` - Creates workspace
- `GetWorkspace(id)` - Retrieves workspace
- `ListWorkspaces()` - Lists all workspaces

#### 2. Data Models (`backend/models/types.go`)

**Note**
```go
ID, WorkspaceID, Title, Content, ParentID
IsFavorite, IsDeleted, CreatedAt, UpdatedAt, DeletedAt
```

**Workspace**
```go
ID, Name, CreatedAt, UpdatedAt
```

**Member** (schema ready, not implemented)
```go
ID, WorkspaceID, Email, Role, CreatedAt
```

**SyncStatus** (schema ready, not implemented)
```go
ID, NoteID, Status, Error, UpdatedAt
```

#### 3. App Bindings (`app.go`)

Exposes Go methods to frontend via Wails:
- Note operations: CreateNote, GetNote, ListNotes, UpdateNote, DeleteNote, ToggleFavorite
- Workspace operations: CreateWorkspace, GetWorkspace, ListWorkspaces
- Startup: Creates default workspace if none exists
- Database connection managed in startup/shutdown lifecycle

### Database Schema

**workspaces** table
```sql
id TEXT PRIMARY KEY
name TEXT NOT NULL
created_at DATETIME NOT NULL
updated_at DATETIME NOT NULL
```

**notes** table
```sql
id TEXT PRIMARY KEY
workspace_id TEXT NOT NULL
title TEXT NOT NULL
content TEXT NOT NULL
parent_id TEXT                    -- For nested notes
is_favorite BOOLEAN DEFAULT 0
is_deleted BOOLEAN DEFAULT 0      -- Soft delete
created_at DATETIME NOT NULL
updated_at DATETIME NOT NULL
deleted_at DATETIME
FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
FOREIGN KEY (parent_id) REFERENCES notes(id)
```

**Indexes:**
- idx_notes_workspace ON notes(workspace_id)
- idx_notes_parent ON notes(parent_id)
- idx_notes_deleted ON notes(is_deleted)
- idx_notes_favorite ON notes(is_favorite)

**members** table (ready for Phase 5)
```sql
id TEXT PRIMARY KEY
workspace_id TEXT NOT NULL
email TEXT NOT NULL
role TEXT NOT NULL               -- owner, editor, viewer
created_at DATETIME NOT NULL
```

**sync_status** table (ready for Phase 5)
```sql
id TEXT PRIMARY KEY
note_id TEXT NOT NULL
status TEXT NOT NULL             -- pending, syncing, synced, error
error TEXT
updated_at DATETIME NOT NULL
```

## Frontend Architecture

### Current State (Phase 0)

**Tech Stack:**
- React 18.2 + TypeScript
- Vite 3.0 (build tool)
- TailwindCSS 4.1 (styling)
- BlockNote 0.41 (editor - installed, not integrated)
- Zustand 5.0 (state - installed, not used yet)
- Framer Motion 12.23 (animations)
- Lucide React 0.548 (icons)
- @dnd-kit (drag-drop - installed, not used yet)

**Current Implementation:**
- Basic Wails template app (App.tsx)
- Tailwind CSS configured
- Wails bindings auto-generated (`frontend/wailsjs/`)
- No custom components yet (Phase 1)

### Configuration Files

**package.json** - Dependencies and scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
```

**vite.config.ts** - Vite configuration
- React plugin enabled
- Path alias: `@/` → `./src/`
- HMR configured for Wails

**tailwind.config.js** - Tailwind CSS
- Dark mode: class-based
- Custom theme from design-guidelines.md (ready to apply)
- Content: `["./src/**/*.{js,jsx,ts,tsx}"]`

**tsconfig.json** - TypeScript
- Target: ES2020
- Strict mode enabled
- Path mapping for `@/*` imports

### Wails Bindings

**frontend/wailsjs/go/main/App.d.ts**
Auto-generated TypeScript definitions for Go methods:
```typescript
export function CreateNote(workspaceID, title, content, parentID)
export function GetNote(id)
export function ListNotes(workspaceID)
export function UpdateNote(id, title, content)
export function DeleteNote(id)
export function ToggleFavorite(id)
export function CreateWorkspace(name)
export function GetWorkspace(id)
export function ListWorkspaces()
export function Greet(name)
```

**Usage Example:**
```typescript
import { CreateNote, ListNotes } from '../wailsjs/go/main/App'

// Create note
const note = await CreateNote('workspace-id', 'My Note', '# Content')

// List notes
const notes = await ListNotes('workspace-id')
```

## Key Dependencies

### Backend (Go)

From `go.mod`:
- `github.com/wailsapp/wails/v2` v2.10.2 - Desktop framework
- `modernc.org/sqlite` v1.29.0 - CGO-free SQLite
- `github.com/google/uuid` v1.6.0 - UUID generation
- `github.com/yuin/goldmark` v1.7.4 - Markdown parser (not used yet)

### Frontend (npm)

From `package.json`:
- `react` 18.2.0 + `react-dom` 18.2.0
- `@blocknote/core` 0.41.1 + `@blocknote/react` 0.41.1 - Editor
- `zustand` 5.0.8 - State management
- `framer-motion` 12.23.24 - Animations
- `lucide-react` 0.548.0 - Icons
- `@dnd-kit/*` 6.3.1 / 10.0.0 - Drag-drop
- `tailwindcss` 4.1.16 - Styling
- `vite` 3.0.7 - Build tool
- `typescript` 4.6.4

## File Purposes

### Backend Files

**app.go** (110 lines)
- App struct with context and database connection
- Startup: Initialize database, create default workspace
- Exposes all CRUD methods to frontend
- Entry point for Wails bindings

**main.go** (Entry point)
- Wails app initialization
- Window configuration (1024x768, frameless option)
- Embeds frontend build (`frontend/dist`)
- Connects App lifecycle (startup/shutdown)

**backend/database/database.go** (105 lines)
- NewDB constructor with data directory setup
- SQLite connection with WAL mode
- Schema migrations (CREATE TABLE, indexes)
- Close method for cleanup

**backend/database/notes.go** (142 lines)
- 6 methods for note operations
- UUID generation for IDs
- Soft delete pattern (is_deleted flag)
- Timestamp management (created_at, updated_at)

**backend/database/workspaces.go** (72 lines)
- 3 methods for workspace operations
- UUID generation
- Basic CRUD without soft delete

**backend/models/types.go** (44 lines)
- 4 data models with JSON tags
- Nullable fields use pointers (*string, *time.Time)
- JSON field names: camelCase (e.g., workspaceId)

### Frontend Files

**frontend/src/App.tsx** (Current: Wails template)
- Basic greeting demo
- Will be replaced with editor UI in Phase 1

**frontend/src/main.tsx** (React entry point)
- Renders App component into root div
- Imports global styles

**frontend/src/index.css** (Tailwind imports)
- `@tailwind base/components/utilities`
- Global CSS variables ready for design system

**frontend/vite.config.ts** (Vite config)
- React plugin
- Path alias for `@/` imports
- HMR config for Wails dev mode

**frontend/tailwind.config.js** (Tailwind config)
- Dark mode: class strategy
- Content: src/**/*.{ts,tsx}
- Theme ready to extend with design tokens

**frontend/wailsjs/** (Auto-generated)
- TypeScript definitions for Go methods
- Runtime types for Wails APIs
- Never edit manually (regenerated on `wails dev`)

## Implementation Status

### ✅ Phase 0 Complete (Week 1)

**Completed:**
- Wails v2 project initialized
- Go backend structure with database layer
- SQLite database with migrations (workspaces, notes, members, sync_status)
- Note CRUD operations (create, read, update, delete, favorite)
- Workspace management
- Frontend dependencies installed (React, BlockNote, Tailwind, etc.)
- Tailwind CSS configured
- Wails bindings generated
- Basic app runs successfully

**Not Yet Implemented:**
- BlockNote editor integration
- Sidebar navigation
- Tab system
- State management (Zustand stores)
- Google Drive sync
- Markdown parsing
- UI components (Phase 1+)

### 🔄 Next Steps (Phase 1 - Weeks 2-3)

From implementation plan:
1. Build sidebar component
2. Integrate BlockNote editor
3. Create Zustand stores for notes/workspaces
4. Implement auto-save with debounce
5. Add tab management
6. Create title bar with window controls

## Code Metrics

**Total Files:** 21 TypeScript/Go files (per repomix)

**Top Files by Size (tokens):**
1. runtime.d.ts - 1,945 tokens (Wails runtime types)
2. notes.go - 1,019 tokens (Note CRUD)
3. database.go - 681 tokens (DB init)
4. app.go - 644 tokens (Wails bindings)
5. workspaces.go - 487 tokens

**Total Codebase:** ~7,856 tokens, 30,480 characters

## Conventions Used

### Naming Conventions

**Go:**
- PascalCase for exported types/functions (Note, CreateNote)
- camelCase for unexported (conn, migrate)
- Acronyms uppercase (ID, DB)

**TypeScript:**
- PascalCase for components (App, Editor)
- camelCase for variables/functions (useState, createRoot)
- kebab-case for files (app.tsx, vite.config.ts)

### JSON Field Naming

Go structs use JSON tags for camelCase serialization:
```go
WorkspaceID string `json:"workspaceId"`  // Not workspace_id
```

### Error Handling

Go functions return `(result, error)` tuples:
```go
func CreateNote(...) (*models.Note, error) {
  // ...
  if err != nil {
    return nil, fmt.Errorf("failed to create note: %w", err)
  }
  return note, nil
}
```

### Database Patterns

- **Soft delete:** is_deleted flag + deleted_at timestamp
- **UUIDs:** Generated with github.com/google/uuid
- **Timestamps:** CreatedAt/UpdatedAt on all entities
- **Indexes:** Created for all foreign keys and frequent queries

## Development Workflow

### Running the App

```bash
# Development mode (hot reload)
wails dev

# Build for production
wails build

# Frontend only (testing)
cd frontend && npm run dev

# Backend tests (when added)
go test ./...
```

### File Locations

**Database:** `~/.fuknotion/fuknotion.db`
**Logs:** Console output (no file logging yet)
**Config:** wails.json (window size, dev server)

### Hot Reload

Vite HMR configured for Wails dev mode:
- Edit React files → instant reload
- Edit Go files → app restarts
- Edit Tailwind → instant reload

## Architecture Decisions

### Local-First Design

- SQLite as source of truth
- All operations work offline
- Sync queue for Google Drive (Phase 5)

### CGO-Free Build

- Uses modernc.org/sqlite (pure Go)
- No CGO dependencies → easier cross-platform builds

### Soft Delete Pattern

- Notes marked as deleted, not removed
- Enables trash/restore feature (Phase 5)
- Deleted notes excluded from ListNotes

### Parent-Child Hierarchy

- parent_id enables nested notes
- Supports folder-like organization
- No depth limit enforced (UI will limit)

## Unimplemented Modules

### backend/sync/

**Purpose:** Google Drive sync (Phase 5)
**Planned:**
- OAuth 2.0 flow (oauth.go)
- Drive API client (drive.go)
- Sync queue processor (queue.go)
- Conflict resolution (conflict.go)

### backend/markdown/

**Purpose:** Markdown parsing (Phase 2)
**Planned:**
- Goldmark configuration
- Markdown → HTML rendering
- Custom extensions (callouts, etc.)

### frontend/src/components/

**Purpose:** React components (Phase 1+)
**Planned:**
- Editor/ - BlockNote wrapper
- Sidebar/ - Navigation tree
- Tabs/ - Tab management
- TitleBar/ - Custom window chrome
- ui/ - shadcn/ui components

### frontend/src/stores/

**Purpose:** Zustand state management (Phase 1+)
**Planned:**
- noteStore.ts - Note CRUD state
- workspaceStore.ts - Workspace state
- uiStore.ts - UI state (sidebar open, theme)

## Security Considerations

### Current State

- No authentication (local desktop app)
- No encryption (SQLite plaintext)
- No network access (offline-only)

### Future (Phase 5)

- Google OAuth tokens stored securely
- Consider E2E encryption for cloud sync
- Member permissions enforced in backend

## Performance Notes

### Database

- WAL mode enables concurrent reads
- Indexes on foreign keys and common queries
- No query optimization yet (small dataset)

### Frontend

- Vite dev server fast (<200ms HMR)
- No code splitting yet
- No lazy loading yet
- BlockNote performance TBD (Phase 2)

## Known Limitations

1. **No UI yet** - Template app only, editor in Phase 1
2. **Single workspace** - Multi-workspace UX not designed
3. **No undo/redo** - BlockNote provides this
4. **No search** - Full-text search in Phase 3
5. **No sync** - Offline-only until Phase 5
6. **No tests** - Test suite in Phase 6
7. **No error boundaries** - Add in Phase 1

## Related Documentation

- [Implementation Plan](../plans/251028-implementation-plan.md) - 12-week roadmap
- [Design Guidelines](./design-guidelines.md) - Complete design system
- [README](../README.md) - Project overview
- [Research Reports](../plans/research/) - Tech stack analysis

---

**Generated:** 2025-10-29
**Codebase Snapshot:** Phase 0 complete
**Next Phase:** Phase 1 (Core UI Infrastructure)
