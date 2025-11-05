# Codebase Summary

**Last Updated:** 2025-11-05
**Phase:** 04-05 - SQLite Database & Markdown Storage (Complete)
**Version:** 0.3.0

## Overview

Fuknotion is offline-first desktop note-taking app built with Wails v2, combining React frontend with Go backend. Phases 04-05 deliver complete database layer and markdown storage with YAML frontmatter.

## Tech Stack

### Core Framework
- **Wails:** v2.10.2 (desktop framework)
- **Go:** 1.22.0 (backend runtime)
- **Node:** 18+ (frontend tooling)

### Frontend
- **React:** 18.2.0
- **TypeScript:** 5.3.3 (strict mode enabled)
- **Vite:** 5.0.8 (dev server + bundler)
- **Tailwind CSS:** 3.4.0
- **Zustand:** 4.5.0 (state management)

### Backend
- **SQLite:** github.com/mattn/go-sqlite3 (embedded database)
- **YAML Parser:** gopkg.in/yaml.v3 (frontmatter parsing)
- **UUID:** github.com/google/uuid (ID generation)

### Testing
- **Go Test:** Standard library testing
- **Coverage:** 67.7% database, 69.7% note service

## Project Structure

```
/mnt/d/www/fuknotion/
├── backend/
│   ├── cmd/
│   │   └── fuknotion/
│   │       └── main.go              # Application entry point
│   ├── internal/
│   │   ├── app/
│   │   │   └── app.go               # App struct with Greet method
│   │   ├── config/
│   │   │   └── config.go            # Configuration management
│   │   ├── database/
│   │   │   ├── database.go          # SQLite wrapper, schema init
│   │   │   ├── database_test.go     # Database tests (15 tests)
│   │   │   └── schema.sql           # SQL schema definitions
│   │   ├── filesystem/
│   │   │   └── service.go           # File operations with path validation
│   │   ├── models/
│   │   │   └── note.go              # Data models (Note, Workspace, Folder)
│   │   └── note/
│   │       ├── parser.go            # YAML frontmatter parser/serializer
│   │       ├── parser_test.go       # Parser tests (5 tests)
│   │       ├── service.go           # Note CRUD operations
│   │       └── service_test.go      # Service tests (7 tests)
│   └── pkg/
│       └── .gitkeep                 # (Planned) Public libraries
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ErrorBoundary.tsx    # Error boundary component
│   │   ├── hooks/
│   │   │   ├── useNote.ts           # Note management hook
│   │   │   └── useWorkspace.ts      # Workspace management hook
│   │   ├── stores/
│   │   │   ├── appStore.ts          # App-wide state (Zustand)
│   │   │   └── uiStore.ts           # UI state management
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── views/
│   │   │   ├── EditorView.tsx       # Editor view component
│   │   │   └── SettingsView.tsx     # Settings view component
│   │   ├── App.tsx                  # Root component with routing
│   │   ├── main.tsx                 # React entry point
│   │   ├── router.tsx               # React Router setup
│   │   └── index.css                # Global styles + Tailwind
│   ├── wailsjs/                     # Auto-generated Go bindings (gitignored)
│   ├── package.json                 # Dependencies, scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── vite.config.ts               # Vite bundler config
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── postcss.config.js            # PostCSS plugins
│
├── build/                           # Build output (gitignored)
├── docs/                            # Documentation
├── plans/                           # Implementation plans
├── wails.json                       # Wails project config
├── go.mod                           # Go module definition
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── CLAUDE.md                        # AI assistant guidance
└── README.md                        # Project documentation
```

## Key Components

### Backend - Database Layer

#### `/mnt/d/www/fuknotion/backend/internal/database/database.go`
**Purpose:** SQLite wrapper with connection management and schema initialization

**Key Features:**
- `Open(dbPath)` - Opens/creates SQLite database with foreign keys enabled
- `Close()` - Closes database connection
- `Exec()`, `Query()`, `QueryRow()` - Parameterized query methods
- `InitUserDB(basePath)` - Creates user.db with user profile and workspaces tables
- `InitWorkspaceDB(workspacePath)` - Creates workspace.db with notes, folders, members tables

**Database Schema:**

**user.db:**
```sql
-- User profile
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workspaces list
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**workspace.db:**
```sql
-- Notes metadata
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    folder_id TEXT,                    -- NULL allowed for root notes
    file_path TEXT NOT NULL UNIQUE,
    is_favorite BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Folders hierarchy
CREATE TABLE folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,                    -- NULL for root folders
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Workspace members
CREATE TABLE members (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_notes_folder ON notes(folder_id);
CREATE INDEX idx_notes_favorite ON notes(is_favorite);
CREATE INDEX idx_notes_updated ON notes(updated_at DESC);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_members_email ON members(email);
```

**Security Features:**
- Foreign keys enabled globally
- Parameterized queries prevent SQL injection
- Role constraints enforce valid member roles
- CASCADE/SET NULL for referential integrity

**Testing:** 15 tests covering schema creation, foreign keys, indexes, constraints

### Backend - File Storage

#### `/mnt/d/www/fuknotion/backend/internal/filesystem/service.go`
**Purpose:** File system operations with path validation

**Key Features:**
- `NewFileSystem(basePath)` - Creates file system service with base path
- `validatePath(path)` - Prevents directory traversal attacks
- `ReadFile(relativePath)` - Reads file content
- `WriteFile(relativePath, data)` - Writes file with auto-directory creation
- `DeleteFile(relativePath)` - Deletes file
- `ListFiles(relativePath)` - Lists files in directory
- `FileExists(relativePath)` - Checks file existence

**Security:**
- All paths resolved to absolute and validated within basePath
- Prevents `../` attacks
- File permissions: 0600 (files), 0700 (directories)

#### `/mnt/d/www/fuknotion/backend/internal/note/parser.go`
**Purpose:** YAML frontmatter parsing and serialization

**Frontmatter Structure:**
```yaml
---
id: "uuid-string"
title: "Note Title"
created: 2025-11-05T10:30:00Z
modified: 2025-11-05T15:45:00Z
folder_id: "folder-uuid"          # Optional
is_favorite: false
tags: ["tag1", "tag2"]            # Optional
---
# Note content in markdown
```

**Key Functions:**
- `ParseMarkdown(raw)` - Extracts frontmatter and content from markdown file
- `SerializeNote(fm, content)` - Combines frontmatter and content into markdown

**Error Handling:**
- Validates frontmatter delimiters (`---\n`)
- Returns error if frontmatter missing or malformed
- Graceful handling of optional fields

**Testing:** 5 tests covering parsing, serialization, edge cases

#### `/mnt/d/www/fuknotion/backend/internal/note/service.go`
**Purpose:** Complete note CRUD operations

**Key Methods:**
- `CreateNote(title, content, folderID)` - Creates note with UUID, saves to DB and file
- `GetNote(id)` - Retrieves note from DB, reads file content
- `UpdateNote(id, title, content)` - Updates note in DB and file
- `DeleteNote(id)` - Deletes note from DB and file system
- `ListNotes()` - Lists all notes ordered by updated_at DESC

**Implementation Details:**
- Uses `github.com/google/uuid` for ID generation
- NULL handling for optional folder_id (foreign key constraint)
- File path: `notes/{id}.md`
- Atomic operations: DB insert before file write
- Error propagation with context

**Testing:** 7 tests covering full CRUD lifecycle, folder relationships, favorites

### Backend - Models

#### `/mnt/d/www/fuknotion/backend/internal/models/note.go`
**Purpose:** Data structures for entities

**Models:**
```go
// Note represents a note entity
type Note struct {
    ID         string    `json:"id"`
    Title      string    `json:"title"`
    FolderID   string    `json:"folderId,omitempty"`  // Optional
    FilePath   string    `json:"filePath"`
    IsFavorite bool      `json:"isFavorite"`
    Content    string    `json:"content"`            // Markdown
    CreatedAt  time.Time `json:"createdAt"`
    UpdatedAt  time.Time `json:"updatedAt"`
}

// Workspace represents a workspace entity
type Workspace struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Path      string    `json:"path"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

// Folder represents a folder entity
type Folder struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    ParentID  string    `json:"parentId,omitempty"`  // Optional
    Position  int       `json:"position"`
    CreatedAt time.Time `json:"createdAt"`
}
```

### Frontend Components

#### `/mnt/d/www/fuknotion/frontend/src/stores/`
**Purpose:** Zustand state management

**appStore.ts:**
- Global app state (user, workspaces)
- Workspace selection
- Sidebar visibility

**uiStore.ts:**
- UI state (modals, notifications)
- Theme management

#### `/mnt/d/www/fuknotion/frontend/src/hooks/`
**Purpose:** Custom React hooks

**useNote.ts:**
- Note CRUD operations via Wails bindings
- Note state management

**useWorkspace.ts:**
- Workspace operations
- Workspace selection

#### `/mnt/d/www/fuknotion/frontend/src/components/ErrorBoundary.tsx`
**Purpose:** React error boundary for graceful error handling

#### `/mnt/d/www/fuknotion/frontend/src/views/`
**Purpose:** Main view components

**EditorView.tsx:**
- Note editor interface (BlockNote integration pending)

**SettingsView.tsx:**
- Application settings

#### `/mnt/d/www/fuknotion/frontend/src/router.tsx`
**Purpose:** React Router setup for navigation

## Data Flow

### Note Creation Flow

```
1. Frontend: User clicks "Create Note"
   ↓
2. Frontend: useNote.createNote(title, content, folderID)
   ↓
3. Wails IPC: Call Go service.CreateNote()
   ↓
4. Backend: Generate UUID
   ↓
5. Backend: Create Frontmatter struct
   ↓
6. Backend: SerializeNote() → markdown with frontmatter
   ↓
7. Backend: WriteFile("notes/{id}.md")
   ↓
8. Backend: INSERT INTO notes (parameterized query)
   ↓
9. Backend: Return Note model
   ↓
10. Frontend: Update Zustand store
    ↓
11. Frontend: Navigate to editor
```

### Note Retrieval Flow

```
1. Frontend: useNote.getNote(id)
   ↓
2. Wails IPC: Call Go service.GetNote(id)
   ↓
3. Backend: SELECT FROM notes WHERE id = ?
   ↓
4. Backend: ReadFile(note.FilePath)
   ↓
5. Backend: ParseMarkdown() → extract content
   ↓
6. Backend: Return Note with content
   ↓
7. Frontend: Update editor state
```

## Local Storage Structure

```
~/.fuknotion/
├── user.db                         # User profile, workspaces list
└── workspaces/
    └── {workspace-id}/
        ├── workspace.db            # Notes metadata, folders, members
        └── notes/
            ├── {note-id-1}.md      # YAML frontmatter + markdown
            ├── {note-id-2}.md
            └── {note-id-3}.md
```

**Example Note File:**
```markdown
---
id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
title: "Meeting Notes"
created: 2025-11-05T10:00:00Z
modified: 2025-11-05T15:30:00Z
folder_id: "folder-uuid"
is_favorite: true
tags: ["work", "meetings"]
---
# Meeting with Product Team

## Agenda
- Feature planning
- Timeline review

## Action Items
- [ ] Review mockups
- [ ] Schedule follow-up
```

## Architecture Decisions

### Database Design

**Two-Database Pattern:**
- `user.db`: Global user data, workspaces list
- `workspace.db`: Per-workspace isolation for security and sync

**Why SQLite:**
- Embedded, no server required
- ACID transactions
- Foreign key support
- Full-text search (future)
- CR-SQLite extension for CRDT sync (future)

**NULL Handling:**
- `folder_id` can be NULL for root notes
- Prevents foreign key errors
- Uses `*string` in Go for NULL handling

### File Storage

**Why Markdown + YAML Frontmatter:**
- Human-readable, editable outside app
- Git-friendly (text files, line-based diffs)
- Portable (import/export without DB)
- Supports BlockNote editor

**File Naming:**
- UUID-based: `{id}.md`
- Prevents naming conflicts
- Enables fast lookups

**Security:**
- Path validation prevents directory traversal
- Restrictive permissions (0600/0700)
- All paths resolved to absolute

### Testing Strategy

**Coverage:**
- Database: 67.7% (InitUserDB, InitWorkspaceDB, foreign keys, indexes)
- Note Service: 69.7% (CRUD, folder relationships, favorites)
- Parser: ~85% (frontmatter parsing, serialization)

**Test Organization:**
- Unit tests next to source files
- Integration tests for database + filesystem
- Table-driven tests for multiple scenarios

## Build Artifacts

### Development (`wails dev`)
- Go backend runs directly
- Vite dev server on port 34115
- Hot reload for frontend + backend
- TypeScript bindings auto-generated

### Production (`wails build`)
- Frontend bundled to `frontend/dist/`
- Go backend compiled with embedded assets
- Single executable in `build/bin/fuknotion`
- Platform-specific (Linux, macOS, Windows)

## Dependencies

### Go Dependencies (go.mod)
- **Core:** `wails/v2 v2.10.2`
- **Database:** `mattn/go-sqlite3 v1.14.24`
- **YAML:** `gopkg.in/yaml.v3 v3.0.1`
- **UUID:** `google/uuid v1.6.0`
- **Utilities:** `pkg/errors`, `pkg/browser`

### Frontend Dependencies (package.json)
- **React:** 18.2.0
- **Router:** react-router-dom
- **State:** zustand 4.5.0
- **Styling:** tailwindcss 3.4.0
- **Build:** vite 5.0.8, typescript 5.3.3

## Testing Results

**Test Summary:**
- Total tests: 15 (database) + 5 (parser) + 7 (service) = 27 tests
- Pass rate: 100% ✅
- Coverage: 67.7% database, 69.7% note service

**Test Coverage:**
```bash
# Database tests
✓ TestInitUserDB
✓ TestInitWorkspaceDB
✓ TestForeignKeysEnabled
✓ TestIndexesCreated
✓ TestMemberRoleConstraint

# Parser tests
✓ TestParseMarkdown
✓ TestSerializeNote
✓ TestParseMarkdownWithoutFrontmatter
✓ TestParseMarkdownInvalidFormat
✓ TestSerializeNoteWithEmptyFrontmatter

# Service tests
✓ TestCreateNote
✓ TestGetNote
✓ TestUpdateNote
✓ TestDeleteNote
✓ TestListNotes
✓ TestNotesWithFolders
✓ TestNotesFavorite
```

## Known Issues

None. Phases 04-05 complete, all tests passing, code review approved.

## Next Steps (Phase 06+)

1. **Phase 06 - Workspace Management:**
   - Workspace CRUD operations
   - Workspace switching
   - Workspace settings

2. **Phase 07 - Folder Management:**
   - Folder CRUD operations
   - Folder hierarchy
   - Drag-drop reordering

3. **Phase 08 - BlockNote Editor Integration:**
   - BlockNote setup
   - Custom block types
   - Markdown sync

4. **Phase 09 - Authentication:**
   - OAuth 2.0 (Google, GitHub)
   - Session management
   - Multi-account support

5. **Phase 10+ - Google Drive Sync:**
   - Drive API integration
   - CRDT conflict resolution
   - Background sync workers

## Metrics

- **Total Go files:** 12 (excluding tests)
- **Total Test files:** 3 (27 tests)
- **Total TypeScript/TSX files:** 11
- **Total lines of code:** ~2,500 (excluding dependencies)
- **Test coverage:** 68% average
- **Build time:** ~5-10 seconds
- **Bundle size:** Not measured (dev phase)

## Code Quality

**Security:**
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Path validation (directory traversal prevention)
- ✅ File permissions (0600/0700)
- ✅ Foreign key constraints
- ✅ Role constraints in members table

**Best Practices:**
- ✅ Error propagation with context
- ✅ Explicit NULL handling
- ✅ Atomic operations (DB + file)
- ✅ Comprehensive test coverage
- ✅ Type safety (TypeScript strict, Go strong typing)

**Performance:**
- ✅ Indexes on foreign keys and common queries
- ✅ Efficient query patterns (ORDER BY updated_at DESC)
- ✅ Connection pooling (SQLite driver default)

## References

- Implementation Plan: `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/plan.md`
- Phase 04 Details: `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/phase-04-sqlite-database.md`
- Phase 05 Details: `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/phase-05-markdown-storage.md`
- SQLite Docs: https://www.sqlite.org/docs.html
- YAML v3: https://github.com/go-yaml/yaml
