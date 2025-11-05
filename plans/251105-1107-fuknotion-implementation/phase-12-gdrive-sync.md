# Phase 12: Google Drive Sync with Conflict Resolution

**Phase:** 12/17 | **Duration:** 5 days | **Priority:** Critical | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 11 | **Next:** Phase 13
**Research:** `../reports/251105-researcher-gdrive-to-planner.md`, `../reports/251105-researcher-sqlite-to-planner.md`

## Overview

Implement Google Drive sync for SQLite (CRDT) and markdown files (three-way merge), background sync, conflict resolution.

## Key Insights

- Drive REST API v3 (Android API deprecated 2025)
- SQLite syncs via CR-SQLite operation logs (automatic merge)
- Markdown files use three-way merge (base, local, remote)
- Sync every 5 min in background
- Offline-first (queue operations)

## Requirements

**Functional:**
- Upload/download files to/from Drive
- Sync SQLite change logs (CRDT)
- Three-way merge for markdown
- Background sync (5 min interval)
- Conflict resolution UI
- Sync status indicator

**Non-Functional:**
- Sync completes under 30s (100 notes)
- No data loss on conflicts
- Graceful offline mode

## Architecture

```go
// backend/internal/sync/manager.go
type SyncManager struct {
    driveService *drive.Service
    db           *sql.DB
}

func (s *SyncManager) SyncWorkspace(wsID string) error
func (s *SyncManager) SyncDatabase(wsID string) error
func (s *SyncManager) SyncMarkdownFiles(wsID string) error
func (s *SyncManager) ResolveConflict(file string) error
```

## Related Files

**Create:**
- `backend/internal/sync/manager.go`
- `backend/internal/sync/drive_client.go`
- `backend/internal/sync/conflict_resolver.go`
- `backend/internal/sync/merge.go`
- `frontend/src/components/Sync/SyncStatus.tsx`
- `frontend/src/components/Sync/ConflictDialog.tsx`

## Implementation Steps

1. Drive API Setup
2. Folder Structure creation
3. Upload/Download files
4. SQLite change log export
5. CRDT merge logic
6. Markdown three-way merge
7. Conflict detection and UI
8. Background sync timer
9. Sync state tracking
10. Error handling
11. Status indicator

## Todo List

- [ ] Drive API client
- [ ] Folder structure
- [ ] Upload/download
- [ ] SQLite sync
- [ ] Markdown merge
- [ ] Conflict UI
- [ ] Background sync
- [ ] Status indicator
- [ ] Error handling
- [ ] Multi-device testing

## Success Criteria

- Files sync correctly
- SQLite merges (CRDT)
- Markdown conflicts resolved
- Background sync works
- No data loss

## Risk Assessment

**Risk:** CRDT merge bugs
**Mitigation:** Testing, fallback to manual

**Risk:** Drive rate limits
**Mitigation:** Client-side limiting, backoff

## Security

- OAuth tokens in keychain
- Validate file metadata

## Next Steps

Phase 13: Sharing System
