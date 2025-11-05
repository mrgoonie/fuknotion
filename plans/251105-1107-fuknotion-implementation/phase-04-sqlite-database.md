# Phase 04: Local SQLite Database Design & Implementation

**Phase:** 04/17 | **Duration:** 2 days | **Priority:** Critical | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 03 | **Next:** Phase 05
**Research:** `../reports/251105-researcher-sqlite-to-planner.md`

## Overview

Design and implement SQLite databases (user.db, workspace DBs) with CR-SQLite for CRDT-based sync, no conflicts.

## Key Insights

- CR-SQLite extension enables multi-writer support
- CRDT = automatic conflict resolution
- Sync via operation logs, not full DB
- One DB per workspace (isolation)
- User.db for profile + workspace list

## Requirements

**Functional:**
- user.db stores profile, workspaces, auth state
- Workspace DBs store notes metadata, folders, members
- CR-SQLite enabled on all tables
- CRUD operations for all entities

**Non-Functional:**
- Queries under 50ms for typical operations
- DB files under 100MB per workspace (10k notes)
- ACID transactions

## Architecture

```sql
-- user.db
CREATE TABLE user (id, email, name, avatar_url, created_at);
CREATE TABLE workspaces (id, name, role, drive_folder_id, last_synced_at);
CREATE TABLE sync_state (key, value);

-- ws-{id}.db
CREATE TABLE notes (id, title, folder_id, is_favorite, created_by, created_at, modified_at, file_path);
SELECT crsql_as_crr('notes');

CREATE TABLE folders (id, name, parent_id, position, created_at);
SELECT crsql_as_crr('folders');

CREATE TABLE members (user_id, email, name, role, joined_at);
SELECT crsql_as_crr('members');
```

## Related Files

**Create:**
- `backend/internal/database/user_db.go`
- `backend/internal/database/workspace_db.go`
- `backend/internal/database/migrations.go`
- `backend/internal/models/note.go`
- `backend/internal/models/folder.go`

## Implementation Steps

1. **Install CR-SQLite** - Go bindings
2. **User DB Schema** - Profile, workspaces, sync state
3. **Workspace DB Schema** - Notes, folders, members
4. **Enable CRDT** - `crsql_as_crr()` on tables
5. **Repository Pattern** - CRUD operations
6. **Migrations** - Schema versioning
7. **Connection Pooling** - Multiple DBs open
8. **Indexing** - Performance optimization
9. **FTS5 Setup** - Full-text search (Phase 10)

## Todo List

- [ ] Install cr-sqlite Go package
- [ ] Create user.db schema + migrations
- [ ] Create workspace.db schema + migrations
- [ ] Enable CRDT on all tables
- [ ] Implement repository pattern
- [ ] Add indexes for performance
- [ ] Test CRUD operations
- [ ] Test CRDT merge behavior
- [ ] Connection pooling
- [ ] Error handling

## Success Criteria

- user.db created on first run
- Workspace DBs created per workspace
- All CRUD operations work
- CRDT enabled (no "constraint failed" on conflict)
- Queries performant (<50ms)

## Risk Assessment

**Risk:** CR-SQLite compilation issues
**Mitigation:** Use pre-built binaries, document requirements

**Risk:** CRDT unexpected behavior
**Mitigation:** Unit tests for conflict scenarios

## Security

- DB files mode 0600 (user only)
- SQL injection prevention (parameterized queries)
- No sensitive data in plain text

## Next Steps

Phase 05: Markdown File Storage with Metadata
