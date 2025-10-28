# Fuknotion System Architecture

**Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Phase 0 Complete

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Data Flow](#data-flow)
5. [Sync Architecture](#sync-architecture)
6. [Database Schema](#database-schema)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

### System Overview

Fuknotion follows a **local-first architecture** with optional cloud sync. The desktop app runs natively on Windows/macOS, with all data stored locally in SQLite and synced to Google Drive when online.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUKNOTION DESKTOP APP                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FRONTEND (React + TypeScript)                │  │
│  │                                                            │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │  │
│  │  │  Sidebar  │  │  Editor   │  │   Tabs    │            │  │
│  │  └───────────┘  └───────────┘  └───────────┘            │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────┐             │  │
│  │  │     Zustand Stores (State Management)   │             │  │
│  │  └─────────────────────────────────────────┘             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ Wails Bindings (IPC)                │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                BACKEND (Go)                               │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │ Database │  │   Sync   │  │ Markdown │               │  │
│  │  │  Layer   │  │  Engine  │  │  Parser  │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  │       │             │                                      │  │
│  │       ▼             ▼                                      │  │
│  │  ┌──────────┐  ┌──────────┐                              │  │
│  │  │  SQLite  │  │  Sync    │                              │  │
│  │  │   WAL    │  │  Queue   │                              │  │
│  │  └──────────┘  └──────────┘                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Optional)
                              ▼
                     ┌─────────────────┐
                     │  Google Drive   │
                     │   (Cloud Sync)  │
                     └─────────────────┘
```

### Key Architectural Decisions

**1. Wails v2 Framework**
- Combines Go backend with web frontend
- Native OS integration (file system, window management)
- No Electron overhead (smaller binary, less memory)
- WebView rendering (uses system browser engine)

**2. Local-First Design**
- SQLite as single source of truth
- All operations work offline
- Sync queue for deferred cloud operations
- Conflict resolution at sync time

**3. CGO-Free Build**
- Uses `modernc.org/sqlite` (pure Go)
- Cross-platform builds without C compiler
- Simpler deployment and distribution

**4. Block-Based Editor**
- BlockNote library (React)
- Notion-like editing experience
- Built-in undo/redo, drag-drop
- Markdown serialization

---

## Backend Architecture

### Go Service Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      app.go (Entry Point)                    │
│  - Wails lifecycle (startup, shutdown)                       │
│  - Exposes methods to frontend                               │
│  - Dependency injection (database, sync)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   database   │  │     sync     │  │   markdown   │
│    package   │  │   package    │  │   package    │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ├──► database.go     - DB init, migrations
        ├──► notes.go        - Note CRUD
        ├──► workspaces.go   - Workspace CRUD
        └──► models/types.go - Data models
```

### Database Layer

**Purpose:** Encapsulate all SQLite operations.

**Components:**
- `database.go` - Connection management, schema migrations
- `notes.go` - Note CRUD operations
- `workspaces.go` - Workspace CRUD operations
- `models/types.go` - Data structures (Note, Workspace, Member, SyncStatus)

**Design Patterns:**
- Repository pattern (DB struct with methods)
- Soft delete (is_deleted flag, not hard delete)
- UUID-based IDs (not auto-increment for sync)
- Timestamp tracking (created_at, updated_at)

**Key Features:**
- WAL mode for concurrent reads
- Foreign key constraints enforced
- Indexes on common queries
- Transaction support (future)

### Sync Layer (Phase 5)

**Purpose:** Google Drive sync with conflict resolution.

**Components:**
- `oauth.go` - OAuth 2.0 flow with PKCE
- `drive.go` - Drive API client (upload, download, list)
- `queue.go` - Sync queue processor
- `conflict.go` - Three-way merge algorithm

**Sync Strategy:**
1. User edits note → queued for upload
2. Background worker runs every 5min
3. Process queue (batch 10 notes)
4. Detect conflicts (compare timestamps)
5. Resolve with three-way merge or UI prompt

**Conflict Resolution:**
- No conflict: Local changes win (upload)
- Remote newer: Download and merge
- Both changed: Three-way merge (local, remote, base)
- Merge failed: Show conflict UI to user

### Markdown Layer (Phase 2)

**Purpose:** Parse and render markdown.

**Components:**
- `parser.go` - Goldmark configuration

**Features:**
- GFM (GitHub Flavored Markdown) support
- Code syntax highlighting
- Custom extensions (callouts, internal links)
- Markdown → HTML rendering for export

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx
│
├─── TitleBar          (window controls)
│
├─── Sidebar
│    ├─── Search
│    ├─── QuickActions
│    ├─── FavoritesList
│    ├─── PageTree      (drag-drop, nested)
│    └─── Footer        (settings, trash, theme)
│
├─── TabBar
│    └─── Tab          (draggable, closable)
│
└─── EditorPage
     ├─── TitleInput   (auto-save)
     └─── Editor       (BlockNote)
          ├─── SlashMenu
          ├─── MiniToolbar
          └─── Blocks
```

### State Management

**Zustand Stores:**

**noteStore.ts**
```typescript
interface NoteStore {
  notes: Note[]
  activeNote: Note | null
  loading: boolean
  error: string | null

  // Actions
  loadNotes: (workspaceId: string) => Promise<void>
  createNote: (workspaceId, title, content) => Promise<void>
  updateNote: (id, title, content) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setActiveNote: (note: Note | null) => void
}
```

**workspaceStore.ts**
```typescript
interface WorkspaceStore {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null

  // Actions
  loadWorkspaces: () => Promise<void>
  createWorkspace: (name: string) => Promise<void>
  switchWorkspace: (id: string) => void
}
```

**uiStore.ts**
```typescript
interface UIStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  openTabs: Tab[]
  activeTabId: string | null

  // Actions
  toggleSidebar: () => void
  setTheme: (theme) => void
  openTab: (noteId: string) => void
  closeTab: (tabId: string) => void
}
```

**Why Zustand?**
- Lightweight (1KB)
- No boilerplate (no actions/reducers)
- TypeScript-first
- React hooks integration
- Middleware support (persist, devtools)

### Component Patterns

**Container/Presenter Pattern:**
```tsx
// EditorPage.tsx (Container - connects to store)
export function EditorPage() {
  const { activeNote, updateNote } = useNoteStore()
  const handleSave = (content) => updateNote(activeNote.id, content)

  return <Editor note={activeNote} onSave={handleSave} />
}

// Editor.tsx (Presenter - pure component)
export function Editor({ note, onSave }) {
  const [content, setContent] = useState(note.content)
  // ...
  return <BlockNoteView editor={editor} />
}
```

**Custom Hooks:**
```tsx
// useAutoSave.ts
export function useAutoSave(value, onSave, delay = 2000) {
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    onSave(debouncedValue)
  }, [debouncedValue])
}

// Usage
useAutoSave(content, handleSave, 2000)
```

### Styling Architecture

**TailwindCSS + CSS Variables:**
```css
/* globals.css */
:root {
  --background: hsl(0, 0%, 98%);
  --foreground: hsl(0, 0%, 12%);
  --accent: hsl(199, 89%, 48%);
  /* ... all design tokens */
}

.dark {
  --background: hsl(0, 0%, 10%);
  --foreground: hsl(0, 0%, 89%);
  --accent: hsl(199, 80%, 52%);
  /* ... dark theme overrides */
}
```

**Utility-First Approach:**
- Use Tailwind classes directly in components
- Custom classes for reusable patterns
- Design tokens in CSS variables (theme-agnostic)
- shadcn/ui for pre-built accessible components

---

## Data Flow

### CRUD Operations

**Create Note Flow:**

```
User clicks "New Page"
  │
  ▼
Sidebar component
  │ handleNewNote()
  ▼
noteStore.createNote(workspaceId, title, content)
  │
  ▼
Wails binding: CreateNote(workspaceId, title, content)
  │ (IPC: Frontend → Backend)
  ▼
app.go: CreateNote(...)
  │
  ▼
database.CreateNote(...)
  │
  ├─► Generate UUID
  ├─► Set timestamps
  ├─► INSERT INTO notes
  └─► Return Note struct
      │
      ▼
   (IPC: Backend → Frontend)
      │
      ▼
noteStore updates state
  │ notes = [...notes, newNote]
  │ activeNote = newNote
  ▼
React re-renders
  │ Sidebar shows new note
  └─► Editor opens with blank content
```

**Update Note Flow (Auto-Save):**

```
User types in editor
  │
  ▼
Editor.tsx: setContent(newContent)
  │
  ▼
useAutoSave hook
  │ Debounce 2s
  ▼
handleSave(content)
  │
  ▼
noteStore.updateNote(id, title, content)
  │
  ▼
Wails binding: UpdateNote(id, title, content)
  │ (IPC)
  ▼
database.UpdateNote(...)
  │
  ├─► UPDATE notes SET content = ?, updated_at = ? WHERE id = ?
  └─► Return nil or error
      │
      ▼
   (IPC: Backend → Frontend)
      │
      ▼
noteStore updates state
  │ notes = notes.map(n => n.id === id ? {...n, content, updatedAt} : n)
  ▼
Show "Saved" indicator
```

### Search Flow (Phase 3)

```
User presses ⌘K
  │
  ▼
SearchModal opens
  │
  ▼
User types query: "react"
  │ onChange debounce 100ms
  ▼
Wails binding: SearchNotes(workspaceId, query)
  │ (IPC)
  ▼
database.SearchNotes(...)
  │
  ├─► SELECT * FROM notes_fts WHERE notes_fts MATCH ?
  └─► Return matched notes with snippets
      │
      ▼
   (IPC: Backend → Frontend)
      │
      ▼
SearchModal displays results
  │
  ▼
User selects result
  │
  ▼
noteStore.setActiveNote(selectedNote)
  │
  └─► Editor opens note
```

---

## Sync Architecture

### Local-First Sync (Phase 5)

**Architecture:**
```
┌──────────────────────────────────────────────────────────────┐
│                      LOCAL DATABASE                          │
│                   (Source of Truth)                          │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Notes Table                                        │     │
│  │  - id, title, content, updated_at, drive_file_id  │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                   │
│                           │ On create/update/delete          │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Sync Queue                                         │     │
│  │  - id, note_id, operation (create/update/delete)  │     │
│  │  - status, retry_count, error                      │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ Background worker (5min interval)
                           ▼
        ┌──────────────────────────────────────┐
        │      SYNC QUEUE PROCESSOR            │
        │                                       │
        │  1. Fetch batch (10 items)           │
        │  2. For each item:                   │
        │     - Upload/Download/Delete         │
        │     - Update drive_file_id           │
        │     - Remove from queue if success   │
        │     - Increment retry if error       │
        └──────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
        ┌──────────────────────────────────────┐
        │         GOOGLE DRIVE API             │
        │                                       │
        │  /Fuknotion/                         │
        │  ├── workspace-1/                    │
        │  │   ├── note-1.md                   │
        │  │   └── note-2.md                   │
        │  └── workspace-2/                    │
        │      └── note-3.md                   │
        └──────────────────────────────────────┘
```

### Sync Operations

**Create Note:**
1. User creates note → saved to SQLite
2. Queued for upload: `INSERT INTO sync_queue (note_id, operation='create')`
3. Background worker uploads markdown to Drive
4. Store `drive_file_id` in notes table
5. Remove from sync_queue

**Update Note:**
1. User edits note → saved to SQLite (updated_at timestamp)
2. Queued for upload: `INSERT INTO sync_queue (note_id, operation='update')`
3. Worker compares timestamps:
   - Local newer → upload
   - Remote newer → download and merge
   - Both changed → three-way merge
4. Remove from queue if success

**Delete Note:**
1. User deletes note → soft delete (is_deleted=1)
2. Queued: `INSERT INTO sync_queue (note_id, operation='delete')`
3. Worker deletes file from Drive
4. Remove from queue

### Conflict Resolution

**Three-Way Merge:**
```
Conflict detected (local updated_at != remote modifiedTime)
  │
  ├─► Fetch 3 versions:
  │   - Local (current state)
  │   - Remote (Drive state)
  │   - Base (last synced state from metadata)
  │
  ├─► Line-based diff algorithm
  │
  ├─► Merge outcome:
  │   ├─► Clean merge → auto-resolve
  │   └─► Conflict markers → show UI
  │
  └─► User resolves manually if needed
```

**Conflict UI (Phase 5):**
```tsx
<ConflictModal>
  <DiffViewer
    local={localContent}
    remote={remoteContent}
    base={baseContent}
  />
  <Actions>
    <Button onClick={acceptLocal}>Keep Local</Button>
    <Button onClick={acceptRemote}>Keep Remote</Button>
    <Button onClick={merge}>Merge Both</Button>
  </Actions>
</ConflictModal>
```

### Sync States

**Sync Status Indicator:**
- ✅ Synced - All changes uploaded
- 🔄 Syncing - Upload/download in progress
- ⏸️ Paused - Offline or rate limited
- ❌ Error - Sync failed (show details)

**Error Handling:**
- Exponential backoff (1s, 2s, 4s, 8s, 16s)
- Max 5 retries per item
- After 5 failures, mark as error and notify user
- User can manually retry from settings

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐
│   workspaces     │
│ ───────────────  │
│ id (PK)          │◄────┐
│ name             │     │
│ created_at       │     │
│ updated_at       │     │
└──────────────────┘     │
                         │
                         │ workspace_id (FK)
                         │
┌──────────────────┐     │
│      notes       │     │
│ ───────────────  │     │
│ id (PK)          │     │
│ workspace_id     ├─────┘
│ title            │
│ content          │
│ parent_id (FK)   ├───┐ (self-referential)
│ is_favorite      │   │
│ is_deleted       │   │
│ created_at       │   │
│ updated_at       │   │
│ deleted_at       │   │
│ drive_file_id    │   │
└──────────────────┘   │
         ▲             │
         └─────────────┘

┌──────────────────┐
│     members      │
│ ───────────────  │
│ id (PK)          │
│ workspace_id (FK)├───────► workspaces
│ email            │
│ role             │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│  sync_status     │
│ ───────────────  │
│ id (PK)          │
│ note_id (FK)     ├───────► notes
│ status           │
│ error            │
│ updated_at       │
└──────────────────┘
```

### Schema Details

**workspaces** - Organize notes into isolated containers
- `id` - UUID primary key
- `name` - Workspace display name
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

**notes** - Store markdown notes
- `id` - UUID primary key
- `workspace_id` - FK to workspaces
- `title` - Note title (can be empty for "Untitled")
- `content` - Markdown content
- `parent_id` - FK to notes (self-referential for hierarchy)
- `is_favorite` - Favorite/starred flag
- `is_deleted` - Soft delete flag
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp (for sync)
- `deleted_at` - Deletion timestamp (nullable)
- `drive_file_id` - Google Drive file ID (nullable, Phase 5)

**members** - Workspace collaboration (Phase 5)
- `id` - UUID primary key
- `workspace_id` - FK to workspaces
- `email` - User email address
- `role` - owner, editor, viewer
- `created_at` - Invitation timestamp

**sync_status** - Track sync queue (Phase 5)
- `id` - UUID primary key
- `note_id` - FK to notes
- `status` - pending, syncing, synced, error
- `error` - Error message if failed (nullable)
- `updated_at` - Last sync attempt timestamp

### Indexes

```sql
-- Notes indexes
CREATE INDEX idx_notes_workspace ON notes(workspace_id);
CREATE INDEX idx_notes_parent ON notes(parent_id);
CREATE INDEX idx_notes_deleted ON notes(is_deleted);
CREATE INDEX idx_notes_favorite ON notes(is_favorite);
CREATE INDEX idx_notes_updated ON notes(updated_at);

-- Members index
CREATE INDEX idx_members_workspace ON members(workspace_id);

-- Sync status index
CREATE INDEX idx_sync_status_note ON sync_status(note_id);

-- Full-text search (Phase 3)
CREATE VIRTUAL TABLE notes_fts USING fts5(title, content);
```

---

## Security Architecture

### Current State (Phase 0-4)

**Threat Model:**
- Local-only app, no network access
- No authentication required
- No encryption at rest
- SQLite database in user home directory

**Security Measures:**
- File permissions: 0755 for directory, 0644 for database
- SQL injection prevention: parameterized queries
- Input validation: title/content length limits (future)

**Risks:**
- Database accessible to other processes
- No protection if device compromised
- No backup encryption

### Future State (Phase 5)

**OAuth 2.0 with PKCE:**
```
User clicks "Connect Google Drive"
  │
  ▼
Start OAuth flow with PKCE
  │ code_verifier = random(43 bytes)
  │ code_challenge = SHA256(code_verifier)
  ▼
Open browser with authorization URL
  │ https://accounts.google.com/o/oauth2/v2/auth
  │ ?client_id=...&redirect_uri=http://localhost:8080/callback
  │ &code_challenge=...&code_challenge_method=S256
  ▼
User authorizes
  │
  ▼
Redirect to http://localhost:8080/callback?code=...
  │
  ▼
Exchange code for tokens
  │ POST https://oauth2.googleapis.com/token
  │ { code, code_verifier, client_id, redirect_uri }
  ▼
Store tokens in OS keychain
  │ macOS: Keychain Services
  │ Windows: Credential Manager
  │ Linux: Secret Service API
  ▼
Use access_token for Drive API
  │ Refresh when expired (refresh_token)
```

**Token Storage:**
- macOS: Keychain Services (encrypted)
- Windows: Credential Manager (DPAPI encrypted)
- Linux: Secret Service API (encrypted)
- Never stored in plaintext or localStorage

**Optional E2E Encryption (Future):**
- Encrypt markdown before upload
- Derive key from user password
- Metadata (title, timestamps) in plaintext for search
- Content encrypted with AES-256-GCM

---

## Deployment Architecture

### Build Process

**Development:**
```bash
# Start dev server with HMR
wails dev

# Frontend: Vite dev server (http://localhost:5173)
# Backend: Go app with live reload
# Window: WebView2 (Windows), WebKit (macOS)
```

**Production Build:**
```bash
# Build for current platform
wails build

# Outputs:
# - Windows: fuknotion.exe + WebView2 runtime
# - macOS: Fuknotion.app bundle
# - Linux: fuknotion binary

# Advanced options:
wails build -clean                 # Clean build
wails build -upx                   # Compress with UPX
wails build -webview2 bundled      # Bundle WebView2 (Windows)
wails build -platform windows/amd64 # Cross-compile
```

### Distribution

**Windows:**
- Installer: NSIS (.exe installer)
- Portable: Standalone .exe
- Package managers: Chocolatey, winget
- Requirements: Windows 10 1809+ (WebView2)

**macOS:**
- App bundle: Fuknotion.app
- DMG installer: Drag-and-drop to Applications
- Package managers: Homebrew Cask
- Code signing: Apple Developer ID
- Notarization: Required for Gatekeeper
- Requirements: macOS 12+ (Intel, Apple Silicon)

**Linux:**
- AppImage: Portable, no dependencies
- DEB package: Debian/Ubuntu
- RPM package: Fedora/RHEL
- Flatpak: Sandboxed (future)
- Requirements: Ubuntu 22.04+, Fedora 38+

### Auto-Update (Future)

**Strategy:**
- Check for updates on startup
- Download in background
- Prompt user to restart
- Apply update on next launch

**Implementation:**
- GitHub Releases API for version check
- Download .zip/.dmg/.exe from releases
- Verify signature before applying
- Rollback if update fails

---

## Performance Considerations

### Backend Performance

**Database:**
- WAL mode: Concurrent reads without blocking writes
- Indexes: Fast lookups on workspace_id, parent_id, timestamps
- Connection pooling: Max 1 writer, unlimited readers
- Query optimization: Avoid N+1 queries, use JOINs

**Memory:**
- Go binary: ~20MB resident
- SQLite database: ~1KB per note + content size
- Total: <100MB for 10,000 notes

### Frontend Performance

**Initial Load:**
- Bundle size: <500KB gzipped (target)
- Vite code splitting: Lazy load editor, settings
- Time to interactive: <2s on cold start

**Rendering:**
- BlockNote: Virtual scrolling for large documents (1000+ blocks)
- React.memo: Prevent unnecessary re-renders
- Zustand: Selective subscription (only re-render on relevant state change)

**Auto-Save:**
- Debounce: 2s delay after last keystroke
- Batch updates: Single database write per save
- No blocking: Async, doesn't freeze UI

### Scalability Limits

**Current Design:**
- Max notes per workspace: 100,000 (theoretical)
- Realistic limit: 10,000 notes (UX concern, not technical)
- Max blocks per note: 10,000 (BlockNote limitation)
- Database size: ~10MB per 10,000 notes (avg 1KB each)

**Bottlenecks:**
- SQLite FTS5 search slows at >50,000 notes
- BlockNote virtual scrolling required at >1,000 blocks
- Google Drive sync slow for initial download (10,000 notes = ~30min)

---

## Disaster Recovery

### Backup Strategy

**Automatic Backups:**
- Database file: `~/.fuknotion/fuknotion.db`
- WAL file: `~/.fuknotion/fuknotion.db-wal`
- SHM file: `~/.fuknotion/fuknotion.db-shm`

**User-Initiated Export:**
- Database export: Copy .db file to safe location
- Markdown export: Batch export all notes to .md files
- JSON export: Structured backup with metadata

**Google Drive Sync:**
- Acts as automatic backup (if enabled)
- Not a versioned backup (overwrites on conflict)

### Recovery Procedures

**Corrupted Database:**
1. Close app
2. Copy `fuknotion.db-wal` and `fuknotion.db-shm` to backup location
3. Run SQLite integrity check: `PRAGMA integrity_check`
4. If corrupted, restore from backup or Drive sync

**Accidental Deletion:**
1. Check trash (soft delete UI)
2. Restore from trash within 30 days
3. If hard deleted, restore from Drive sync

**Sync Conflicts:**
1. Automatic three-way merge
2. If merge fails, show conflict UI
3. User manually resolves (keep local, keep remote, or merge)

---

## Monitoring & Logging

### Application Logs

**Log Levels:**
- DEBUG: Development-only, verbose
- INFO: Normal operations (app start, note created)
- WARN: Recoverable errors (sync retry, slow query)
- ERROR: Unrecoverable errors (database corruption, crash)

**Log Location:**
- Development: stdout/stderr
- Production: `~/.fuknotion/logs/fuknotion.log`
- Rotation: Daily, keep 7 days

**What to Log:**
- App lifecycle events (startup, shutdown)
- Database operations (slow queries >100ms)
- Sync operations (upload, download, conflicts)
- Errors with stack traces

### Error Tracking (Future)

**Sentry Integration:**
- Capture frontend errors (React error boundaries)
- Capture backend errors (Go panic recovery)
- User opt-in for telemetry
- No PII (personally identifiable information) logged

---

## Appendices

### Technology Choices Rationale

**Wails vs Electron:**
- Smaller binary (10MB vs 100MB)
- Less memory usage (50MB vs 200MB)
- Native OS integration
- Go backend (fast, simple)
- Cons: Smaller ecosystem, newer project

**SQLite vs PostgreSQL:**
- Embedded (no server process)
- Zero configuration
- Cross-platform
- Fast for single-user workloads
- Cons: No multi-user concurrency (not needed)

**BlockNote vs TipTap vs Slate:**
- BlockNote: Batteries-included, Notion-like out-of-box
- TipTap: More flexible, more setup
- Slate: Low-level, complex
- Decision: BlockNote for MVP, can switch later

**Zustand vs Redux vs Context:**
- Zustand: Simplest, least boilerplate
- Redux: Overkill for this app size
- Context: Re-render performance issues
- Decision: Zustand for simplicity + performance

### Future Architecture Improvements

**Phase 7+ (Post-MVP):**
- Real-time collaboration (CRDT with Yjs)
- E2E encryption (libsodium)
- Plugin system (WebAssembly)
- Mobile apps (React Native with shared API)
- Web version (Wails backend + web frontend)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Phase 0 Complete
**Next Phase:** Phase 1 (Core UI Infrastructure)
