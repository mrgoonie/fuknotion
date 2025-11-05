# Research Report: Google Drive Sync for Offline-First Apps

**From:** researcher-gdrive
**To:** planner
**Date:** 2025-11-05
**Topic:** Google Drive sync strategies with conflict resolution

## Executive Summary

Google Drive REST API supports file sync but lacks built-in conflict resolution. Manual conflict detection required via file metadata (modifiedTime, md5Checksum). Recommend: Last-Write-Wins (LWW) with vector clocks OR three-way merge for SQLite db file. Store notes as individual .md files for easier conflict handling.

## API Overview

**Drive REST API v3:**
- Official API (Android Drive API deprecated 2025)
- File upload/download via multipart or resumable uploads
- Metadata includes modifiedTime, version, md5Checksum
- Change notifications via webhooks (requires server)
- No automatic conflict resolution

**Key Operations:**
```
GET /files/{fileId}           # Get file metadata
GET /files/{fileId}?alt=media # Download file content
PATCH /files/{fileId}         # Update file metadata
POST /files                   # Upload new file
```

## Conflict Detection

**When Conflicts Occur:**
- User edits file offline on Device A
- User edits same file offline on Device B
- Both devices sync when reconnected
- Drive creates "[Conflict]" copy if base version differs

**Detection Strategy:**
1. Store last synced modifiedTime + md5Checksum locally
2. Before upload, fetch remote file metadata
3. Compare local lastSync with remote modifiedTime
4. If remote newer than lastSync → conflict detected

## Conflict Resolution Strategies

### 1. Last-Write-Wins (LWW)

**Approach:**
- Compare modifiedTime timestamps
- Newer version overwrites older version
- Simple but data loss possible

**Implementation:**
```go
if remoteModTime.After(localModTime) {
    // Download remote, overwrite local
    downloadFromDrive(fileId)
} else {
    // Upload local, overwrite remote
    uploadToDrive(fileId, localFile)
}
```

**Pros:**
- Simple implementation
- No user intervention

**Cons:**
- Can lose changes
- No merge capability

### 2. Three-Way Merge

**Approach:**
- Keep base version (last common ancestor)
- Compare local + remote changes to base
- Merge non-conflicting changes
- Flag actual conflicts for user

**Implementation:**
```go
baseVersion := getLastSyncedVersion()
localChanges := diff(baseVersion, localVersion)
remoteChanges := diff(baseVersion, remoteVersion)

if !conflicting(localChanges, remoteChanges) {
    merged := merge(localChanges, remoteChanges, baseVersion)
    uploadToDrive(fileId, merged)
} else {
    // Show conflict UI, let user choose
    showConflictResolution(localVersion, remoteVersion)
}
```

**Pros:**
- Preserves changes when possible
- More intelligent merging

**Cons:**
- Complex for binary files (SQLite)
- Requires conflict UI

### 3. Operational Transform (OT)

**Approach:**
- Log operations instead of snapshots
- Transform operations based on concurrent changes
- Apply transformed ops to achieve consistency

**Pros:**
- Real-time collaboration ready
- No data loss

**Cons:**
- Very complex
- Requires operation log storage
- Overkill for single-user offline sync

### 4. CRDT (see SQLite research)

**Approach:**
- Use CRDT-enabled SQLite (cr-sqlite)
- Automatic conflict-free merging
- Sync operation logs instead of full db

**Best fit for SQLite database sync**

## Recommended Architecture for Fuknotion

### Strategy: Hybrid Approach

**For Notes (.md files):**
- Store each note as separate .md file in Drive
- Use Three-Way Merge with line-level diffing
- Markdown merges cleanly (text-based)
- Conflicts rare due to block structure

**For SQLite Database:**
- Use CRDT approach (cr-sqlite extension)
- Sync via operation log, not full db file
- Eliminates db-level conflicts
- See SQLite research report for details

**For Media Files:**
- Last-Write-Wins (immutable typically)
- Store metadata in SQLite
- Actual files in Drive folder

### Sync Flow

**Initial Sync:**
```
1. List all files in Drive folder
2. Compare with local file list
3. Download missing files
4. Upload new local files
5. Store sync state (modifiedTime per file)
```

**Ongoing Sync (every 5 min or on network change):**
```
1. Fetch Drive changes since lastSyncToken
2. For each changed file:
   a. Download remote metadata
   b. Check if local file also changed
   c. If both changed → conflict resolution
   d. Else → download or upload as needed
3. Update lastSyncToken
```

**Conflict Resolution Flow:**
```
1. Detect conflict (both local & remote changed)
2. Download remote version
3. If markdown file:
   - Three-way merge (base, local, remote)
   - If auto-merge succeeds → upload merged
   - If conflicts → show diff UI, let user choose
4. If SQLite:
   - Use CRDT merge (automatic)
5. If media:
   - Show both versions, let user pick
```

## Google Drive Folder Structure

```
/Fuknotion/
├── workspaces/
│   ├── {workspace-id}/
│   │   ├── notes/
│   │   │   ├── {note-id}.md
│   │   │   └── {note-id}.md
│   │   ├── media/
│   │   │   ├── {file-id}.png
│   │   │   └── {file-id}.jpg
│   │   └── database/
│   │       └── workspace.db
│   └── shared/
│       └── {workspace-id}/
└── user-data/
    └── {user-id}.db
```

## Authentication

**OAuth 2.0 Desktop Flow:**
```go
1. Open browser to Google consent screen
2. User grants Drive access
3. Redirect to localhost callback
4. Exchange code for refresh_token
5. Store refresh_token in OS keychain
6. Use refresh_token to get access_token (expires 1hr)
```

**Scopes Required:**
- `https://www.googleapis.com/auth/drive.file` (app-created files only)
- OR `https://www.googleapis.com/auth/drive.appdata` (hidden app folder)

**Recommendation:** Use `drive.file` scope + visible folder for user control.

## Offline-First Implementation

**Local-First Principles:**
1. All operations work offline
2. Sync is background process
3. Conflict resolution is async
4. UI never blocks on sync

**Sync State Machine:**
```
OFFLINE → CONNECTING → SYNCING → SYNCED
   ↓                                  ↓
   ↓←←←←←←←←←←←← ERROR ←←←←←←←←←←←←←←←←↓
```

**Storage:**
```go
type SyncState struct {
    FileID       string
    LastSyncTime time.Time
    Checksum     string
    Status       string  // synced, pending, conflict
}
```

## Performance Optimization

**Batch Operations:**
- Use batch API for multiple file metadata fetches
- Upload multiple files in parallel (goroutines)
- Download media on-demand, not proactively

**Delta Sync:**
- Use `changes.list` with pageToken
- Only process changed files
- Store startPageToken for next sync

**Compression:**
- Gzip markdown files before upload
- Reduces bandwidth usage
- Drive doesn't charge for bandwidth but faster sync

## Error Handling

**Network Errors:**
- Retry with exponential backoff
- Queue operations for later
- Never lose local data

**Rate Limits:**
- Drive: 1000 req/100sec per user
- Implement client-side rate limiting
- Use batch API to reduce request count

**Auth Errors:**
- Refresh token if access_token expired
- Re-authenticate if refresh_token invalid
- Graceful degradation to offline mode

## Security Considerations

**Data in Transit:**
- HTTPS by default (Drive API)
- OAuth tokens never stored in plaintext

**Data at Rest:**
- User controls Drive encryption settings
- Consider client-side encryption for sensitive notes
- Store OAuth tokens in OS keychain

## Limitations

1. **No Real-Time Sync:** Polling required (no websockets from desktop)
2. **Conflict Complexity:** Manual resolution needed for complex conflicts
3. **Binary Files:** SQLite db needs special handling (CRDT or whole-file sync)
4. **Rate Limits:** Can't sync too frequently
5. **Quota:** Free tier 15GB, paid for more

## Alternative Approaches Considered

**Google Drive API Deprecation:**
- Android Drive API deprecated Jan 2025
- REST API is the way forward

**Alternatives to Drive:**
- Dropbox: Better sync API but smaller user base
- OneDrive: Good API but Microsoft account required
- iCloud: Apple-only
- Custom server: More control but deployment complexity

**Verdict:** Google Drive best for cross-platform consumer app.

## Implementation Recommendations

1. Use Drive REST API v3
2. Store notes as individual .md files
3. Use Three-Way Merge for markdown
4. Use CRDT for SQLite (cr-sqlite)
5. Implement background sync every 5 minutes
6. Show sync status in UI
7. Graceful offline mode (queue pending uploads)
8. User-friendly conflict resolution UI

## References

- Drive REST API: https://developers.google.com/drive/api/v3/reference
- OAuth Desktop: https://developers.google.com/identity/protocols/oauth2/native-app
- Conflict strategies: https://stackoverflow.com/questions/26730601

## Unresolved Questions

- Should we use drive.file or drive.appdata scope?
- Sync frequency: 5 min vs event-driven (file watcher)?
- Should base version be stored in Drive or locally?
- How to handle Drive quota exceeded scenario?
