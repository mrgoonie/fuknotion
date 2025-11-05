# Research Report: SQLite Sync with Conflict Resolution

**From:** researcher-sqlite
**To:** planner
**Date:** 2025-11-05
**Topic:** SQLite multi-device sync patterns using CRDT

## Executive Summary

Traditional SQLite file sync causes conflicts when editing on multiple devices. Solution: **CR-SQLite** extension (vlcn-io) provides CRDT-based multi-writer support with automatic conflict resolution. Sync via operation logs instead of full database file. Perfect for offline-first note-taking apps.

## Problem Statement

**Traditional SQLite Sync Issues:**
1. Binary file format → can't merge like text
2. Concurrent edits → corruption if naively synced
3. Last-Write-Wins → data loss
4. Manual conflict resolution → complex UX

**Example Conflict:**
```
Device A: INSERT note (id=1, title="Meeting")
Device B: INSERT note (id=1, title="Todo")
→ Sync conflict: which wins?
```

## Solution: CRDT-Based SQLite

### CR-SQLite (Conflict-Free Replicated SQLite)

**Overview:**
- Extension by vlcn-io (active development 2025)
- Adds multi-writer replication
- CRDT-based automatic conflict resolution
- Syncs operation logs, not full db

**Key Features:**
- Works with existing SQLite
- No schema changes required
- Automatic merge on sync
- Causal ordering preserved

**Installation:**
```go
import "github.com/vlcn-io/cr-sqlite-go"

db, _ := sql.Open("sqlite3", "notes.db")
db.Exec("SELECT crsql_as_crr('notes');")
```

## CRDT Conflict Resolution

**How CRDTs Work:**
1. Each change has unique ID + timestamp + device ID
2. Operations commute (order doesn't matter for final state)
3. Merge is deterministic (same result on all devices)
4. No coordination needed

**Types of CRDTs in CR-SQLite:**

**Last-Write-Wins Register (LWW):**
- For simple columns (title, content)
- Timestamp determines winner
- Automatic and predictable

**Counter CRDT:**
- For numeric values (like counts)
- Increments/decrements merge correctly

**Set CRDT:**
- For collections
- Adds and removes merge without conflicts

## CR-SQLite Architecture

### Core Concepts

**CRR (Conflict-Free Replicated Relation):**
- Table marked as CRDT-enabled
- Tracks metadata per row/column
- Automatic version vector management

**DB Version:**
- Each change increments db_version
- Used to track what's been synced
- Query changes since version N

**Clock (Hybrid Logical Clock):**
- Lamport timestamp + device ID
- Establishes causal ordering
- Resolves conflicts deterministically

### Schema Example

**User Table:**
```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at INTEGER,
    modified_at INTEGER
);

-- Enable CRDT
SELECT crsql_as_crr('notes');
```

**Behind the scenes, CR-SQLite adds:**
```sql
-- Metadata table (internal)
__crsql_notes_clock (
    id TEXT,
    col_name TEXT,
    col_version INTEGER,
    db_version INTEGER,
    site_id BLOB,
    seq INTEGER
)
```

## Sync Protocol

### Pull Changes from Remote

```go
// Get changes since last sync
rows := db.Query(`
    SELECT * FROM crsql_changes
    WHERE db_version > ?
`, lastSyncVersion)

// Apply changes to local db
for rows.Next() {
    var table, pk, cid string
    var val interface{}
    var version int64
    rows.Scan(&table, &pk, &cid, &val, &version, &siteId)

    // CR-SQLite automatically merges
    db.Exec("INSERT INTO crsql_changes VALUES (?, ?, ?, ?, ?, ?)",
        table, pk, cid, val, version, siteId)
}
```

### Push Changes to Remote

```go
// Get local changes since last push
changes := db.Query(`
    SELECT * FROM crsql_changes
    WHERE db_version > ? AND site_id = ?
`, lastPushVersion, localSiteId)

// Send to remote (Drive, sync server, peer)
sendToRemote(changes)
```

### Sync Flow

```
┌─────────┐          ┌─────────┐          ┌─────────┐
│Device A │          │  Drive  │          │Device B │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     │  1. Get changes    │                    │
     │   since v5         │                    │
     │───────────────────>│                    │
     │                    │                    │
     │  2. Changes v6-v8  │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  3. Merge locally  │                    │
     │  (CRDT rules)      │                    │
     │                    │                    │
     │  4. Push v9-v12    │                    │
     │───────────────────>│                    │
     │                    │                    │
     │                    │  5. Pull changes   │
     │                    │<───────────────────│
     │                    │                    │
     │                    │  6. Merged changes │
     │                    │───────────────────>│
     │                    │                    │
```

## Conflict Resolution Examples

### Example 1: Concurrent Title Edits

```
Device A: UPDATE notes SET title='Meeting Notes' WHERE id='1'
Device B: UPDATE notes SET title='Team Meeting' WHERE id='1'

→ CRDT merge: Last-Write-Wins based on Hybrid Logical Clock
→ Result: Title = 'Team Meeting' (if B's clock higher)
→ Deterministic on all devices
```

### Example 2: Concurrent Inserts

```
Device A: INSERT INTO notes VALUES ('uuid-a', 'Note A', ...)
Device B: INSERT INTO notes VALUES ('uuid-b', 'Note B', ...)

→ No conflict: Different primary keys
→ Both notes exist after merge
```

### Example 3: Delete + Update

```
Device A: DELETE FROM notes WHERE id='1'
Device B: UPDATE notes SET title='Updated' WHERE id='1'

→ CRDT rule: Delete wins (last write based on clock)
→ Result: Note deleted
```

## Implementation for Fuknotion

### Architecture

**Local Database:**
```
~/.fuknotion/
├── user.db              # User prefs, auth tokens
└── workspaces/
    ├── ws-123.db        # Workspace A data
    └── ws-456.db        # Workspace B data
```

**Each workspace db contains:**
- Notes metadata (title, created, modified, folder)
- Folders structure
- User settings per workspace
- Sync state

**Actual note content:**
- Stored as .md files (easier to merge text)
- SQLite stores: path, checksum, version
- Text merge = three-way diff
- Metadata merge = CRDT

### Schema Design

```sql
-- Notes table
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    folder_id TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    modified_at INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    checksum TEXT
);
SELECT crsql_as_crr('notes');

-- Folders table
CREATE TABLE folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    position INTEGER,
    created_at INTEGER NOT NULL
);
SELECT crsql_as_crr('folders');

-- Sync state
CREATE TABLE sync_state (
    key TEXT PRIMARY KEY,
    value TEXT
);
```

### Sync Strategy

**What Goes Where:**
- **SQLite (CRDT):** Metadata, structure, relationships
- **Google Drive (.md):** Actual note content (markdown)
- **Sync both:** Coordinated but separate processes

**Why Hybrid?**
1. SQLite CRDT perfect for structured metadata
2. Markdown files easier to merge (text-based)
3. User can access .md files directly in Drive
4. Best of both worlds

### Sync Implementation

```go
type SyncManager struct {
    db           *sql.DB
    driveClient  *drive.Service
    lastVersion  int64
}

func (s *SyncManager) Sync() error {
    // 1. Sync SQLite metadata
    if err := s.syncDatabase(); err != nil {
        return err
    }

    // 2. Sync markdown files
    if err := s.syncMarkdownFiles(); err != nil {
        return err
    }

    return nil
}

func (s *SyncManager) syncDatabase() error {
    // Pull changes from Drive
    remoteChanges := s.downloadChangeLog()

    // Apply to local db (CRDT merge automatic)
    for _, change := range remoteChanges {
        s.db.Exec("INSERT INTO crsql_changes VALUES (...)", change)
    }

    // Push local changes to Drive
    localChanges := s.getLocalChanges(s.lastVersion)
    s.uploadChangeLog(localChanges)

    s.lastVersion = s.getCurrentVersion()
    return nil
}
```

## Performance Considerations

**Change Log Size:**
- Grows indefinitely if not pruned
- Periodic compaction needed
- Keep last N versions or X days

**Compaction Strategy:**
```sql
-- Remove old changes (all devices synced past v100)
DELETE FROM crsql_changes
WHERE db_version < 100;

-- Vacuum to reclaim space
VACUUM;
```

**Optimization:**
- Index on db_version for fast queries
- Batch change application
- Compress change logs before upload to Drive

## Multi-Tenant Considerations

**Workspace Isolation:**
- Separate .db file per workspace
- User can be in multiple workspaces
- Each workspace syncs independently

**Schema:**
```sql
-- User's workspace list
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,  -- owner, editor, viewer
    last_synced INTEGER
);

-- Workspace database (separate file)
-- ws-{id}.db contains notes, folders, etc.
```

**Sync Flow:**
```go
for _, workspace := range user.workspaces {
    wsDb := openDatabase(workspace.id)
    syncDatabase(wsDb, workspace.driveFolder)
}
```

## Offline Mode

**Fully Functional Offline:**
1. All CRUD operations work locally
2. Changes queued in crsql_changes
3. Sync when network available
4. No user intervention required

**Conflict Handling:**
- Automatic via CRDT
- User never sees "conflict" errors
- Deterministic merge on all devices

## Alternative: SQLite-Sync

**sqlite-sync (sqliteai):**
- Similar to cr-sqlite
- More recent project (2025)
- Built for local-first apps
- Same CRDT principles

**Comparison:**
| Feature | cr-sqlite | sqlite-sync |
|---------|-----------|-------------|
| Maturity | 2+ years | <1 year |
| Community | Larger | Smaller |
| Docs | Good | Limited |
| Performance | Proven | Unknown |

**Recommendation:** Use cr-sqlite (more mature).

## References

- CR-SQLite: https://github.com/vlcn-io/cr-sqlite
- SQLite-Sync: https://github.com/sqliteai/sqlite-sync
- CRDT Paper: https://hal.inria.fr/inria-00397981
- Vlcn Blog: https://vlcn.io/blog

## Unresolved Questions

- Should we compact change logs automatically or on user action?
- Max size per workspace db before performance degrades?
- How to handle workspace member list sync without server?
