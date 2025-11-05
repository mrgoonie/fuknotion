# Research Report: Multi-Tenant Architecture for Offline-First Apps

**From:** researcher-multitenant
**To:** planner
**Date:** 2025-11-05
**Topic:** Multi-tenant patterns for offline-first desktop apps

## Executive Summary

Multi-tenancy in offline-first desktop apps = separate databases per workspace + user-based access control. Use **schema-per-tenant** pattern with SQLite: one .db file per workspace. User membership stored in user-level db. Offline mode works because all workspace data local when user has access.

## Multi-Tenancy Concepts

**Tenancy = Workspace in Fuknotion context**

**Requirements:**
- User can be in multiple workspaces
- Each workspace has own notes, folders, settings
- Workspace data isolated (security)
- Members have roles (owner, editor, viewer)
- Works offline (all data local)

**Traditional SaaS Approaches:**
1. **Shared DB + tenant_id column** (not suitable offline)
2. **Schema per tenant** (adaptable for desktop)
3. **DB per tenant** (perfect for desktop)

## Recommended: Database-Per-Workspace

### Architecture

**Local Storage Structure:**
```
~/.fuknotion/
├── user.db                    # User-level data
│   ├── user_profile
│   ├── workspaces             # List of workspaces user belongs to
│   └── sync_state
│
└── workspaces/
    ├── ws-abc123.db           # Workspace A
    │   ├── notes
    │   ├── folders
    │   ├── members
    │   └── settings
    │
    └── ws-def456.db           # Workspace B
        └── ...
```

**Why This Works:**
- Complete isolation (separate .db files)
- Easy to sync (one db per workspace)
- Secure (only download workspaces user has access to)
- Scales (add workspace = add db file)
- Offline-ready (all workspace data local)

### User-Level Database (user.db)

```sql
-- User profile
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at INTEGER
);

-- Workspaces user belongs to
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,        -- owner, editor, viewer
    drive_folder_id TEXT,      -- Google Drive folder for this workspace
    last_synced_at INTEGER,
    created_at INTEGER,
    is_active INTEGER DEFAULT 1
);

-- Sync configuration
CREATE TABLE sync_config (
    key TEXT PRIMARY KEY,
    value TEXT
);
```

### Workspace-Level Database (ws-{id}.db)

```sql
-- Notes
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    folder_id TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    modified_at INTEGER NOT NULL,
    file_path TEXT NOT NULL
);
SELECT crsql_as_crr('notes');

-- Folders
CREATE TABLE folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    position INTEGER,
    created_at INTEGER NOT NULL
);
SELECT crsql_as_crr('folders');

-- Workspace members
CREATE TABLE members (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL,        -- owner, editor, viewer
    invited_by TEXT,
    joined_at INTEGER
);
SELECT crsql_as_crr('members');

-- Workspace settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
SELECT crsql_as_crr('settings');
```

## Multi-Tenant Sync Flow

### 1. User Login

```go
// User authenticates with Google
user := authenticateUser()

// Fetch user's workspaces from Drive
workspaces := fetchWorkspacesFromDrive(user)

// Store in user.db
for _, ws := range workspaces {
    insertWorkspace(userDB, ws)
}
```

### 2. Workspace Discovery

**How user finds workspaces?**

**Option A: Drive Folder Sharing**
```
1. Workspace owner creates folder in Drive: /Fuknotion/ws-abc123/
2. Owner shares folder with member's email
3. Member's app scans Drive for shared Fuknotion folders
4. Discovers workspace → downloads workspace.db
5. Adds to local workspaces list
```

**Option B: Invitation System (requires server)**
```
1. Owner invites member via email
2. Server creates invitation record
3. Member's app polls server for invitations
4. Member accepts → gets workspace ID + Drive folder ID
5. Downloads workspace data
```

**Recommendation:** Start with Option A (serverless), add Option B later.

### 3. Workspace Sync

```go
func SyncWorkspace(wsID string) error {
    // Open workspace database
    wsDB := openDatabase(wsID)

    // Get Drive folder for this workspace
    driveFolderID := getWorkspaceDriveFolderID(wsID)

    // Sync SQLite metadata (CRDT)
    syncDatabase(wsDB, driveFolderID)

    // Sync markdown files
    syncMarkdownFiles(wsDB, driveFolderID)

    return nil
}

// Sync all workspaces
func SyncAll() {
    workspaces := getWorkspaces(userDB)
    for _, ws := range workspaces {
        go SyncWorkspace(ws.ID) // Parallel sync
    }
}
```

## Role-Based Access Control

### Roles

**Owner:**
- Full access (read, write, delete)
- Manage members (invite, remove, change roles)
- Delete workspace

**Editor:**
- Read + write notes
- Create folders
- Cannot manage members or delete workspace

**Viewer:**
- Read-only access
- Can favorite notes (local pref)
- Cannot edit

### Implementation

**Check Permission Before Action:**
```go
func (ws *Workspace) CanEdit(userID string) bool {
    member := ws.GetMember(userID)
    return member.Role == "owner" || member.Role == "editor"
}

func (ws *Workspace) CanManageMembers(userID string) bool {
    member := ws.GetMember(userID)
    return member.Role == "owner"
}

// Usage
if !workspace.CanEdit(currentUser.ID) {
    return errors.New("permission denied")
}
```

**UI-Level:**
```tsx
{workspace.canEdit(user.id) && (
    <EditButton onClick={handleEdit} />
)}

{workspace.role === 'owner' && (
    <MembersPanel />
)}
```

## Offline Mode with Multi-Tenancy

### Challenge: Member Changes While Offline

**Scenario:**
1. User A is offline
2. Owner removes User A from workspace (online)
3. User A comes online → should lose access

**Solution:**
```go
func SyncWorkspace(wsID string) error {
    // Before syncing data, check membership
    members := fetchMembers(wsID)

    if !isMemberOfWorkspace(currentUser, members) {
        // User removed → delete local workspace
        deleteWorkspace(wsID)
        return errors.New("access revoked")
    }

    // Still a member → proceed with sync
    syncDatabase(wsDB, driveFolderID)
    return nil
}
```

**Graceful Handling:**
```
1. Detect access revoked during sync
2. Stop sync
3. Delete local workspace data (security)
4. Show notification: "You've been removed from workspace X"
5. Remove from workspaces list
```

### Workspace Switching

```go
type App struct {
    currentWorkspace *Workspace
}

func (a *App) SwitchWorkspace(wsID string) error {
    // Close current workspace db
    if a.currentWorkspace != nil {
        a.currentWorkspace.Close()
    }

    // Open new workspace db
    ws := OpenWorkspace(wsID)
    a.currentWorkspace = ws

    // Update UI
    a.LoadNotes(ws)

    return nil
}
```

**UI:**
```tsx
// Workspace selector in sidebar
<WorkspaceSwitcher
    workspaces={user.workspaces}
    current={currentWorkspace}
    onChange={switchWorkspace}
/>
```

## Conflict Resolution in Multi-Tenant Context

### Scenario: Two Users Edit Same Note Offline

```
User A (offline): Edits note title to "Meeting Notes"
User B (offline): Edits note title to "Team Meeting"
→ Both sync when online
```

**Resolution:**
- CRDT in SQLite handles this (Last-Write-Wins based on clock)
- Markdown file uses three-way merge
- Deterministic across all members' devices

### Scenario: User Deleted, But Had Pending Changes

```
User A: Makes changes offline
Owner: Removes User A from workspace
User A: Comes online → syncs
```

**Resolution:**
```go
func SyncWorkspace(wsID string) error {
    // Check membership first
    if !isMember(currentUser, wsID) {
        // Don't upload changes, just delete local data
        deleteWorkspace(wsID)
        return errors.New("access revoked")
    }

    // Still a member → sync normally
    syncChanges(wsID)
    return nil
}
```

## Invitation Flow (Serverless)

### Using Drive Folder Sharing

**Owner Invites Member:**
```
1. Owner: Right-click workspace in Fuknotion
2. Select "Invite Member"
3. Enter member's Google email
4. App shares Drive folder with that email (Drive API)
5. Member receives Google Drive sharing notification
```

**Member Accepts:**
```
1. Member opens Fuknotion
2. App scans Drive for shared folders matching pattern:
   /Fuknotion/ws-*/ with "sharedWithMe" flag
3. Finds new workspace
4. Downloads workspace.db
5. Adds to workspaces list
6. Shows notification: "You've been invited to workspace X"
```

**Implementation:**
```go
func DiscoverNewWorkspaces() []Workspace {
    // Query Drive for shared Fuknotion folders
    query := "mimeType='application/vnd.google-apps.folder' " +
             "and name contains 'ws-' " +
             "and sharedWithMe=true " +
             "and trashed=false"

    folders := driveClient.ListFiles(query)

    newWorkspaces := []Workspace{}
    for _, folder := range folders {
        // Check if already in local db
        if !hasWorkspace(folder.ID) {
            // New workspace → download
            ws := downloadWorkspace(folder.ID)
            newWorkspaces = append(newWorkspaces, ws)
        }
    }

    return newWorkspaces
}
```

## Scalability Considerations

**Limits:**
- Max workspaces per user: ~1000 (drive folder listing)
- Max members per workspace: ~100 (practical limit for offline)
- Max notes per workspace: ~10,000 (SQLite handles millions but sync time)

**Optimization:**
- Lazy load workspaces (only active ones synced frequently)
- Archive inactive workspaces (keep in Drive, remove local)
- Paginate large note lists

## Security & Privacy

**Data Isolation:**
- Each workspace = separate DB file
- No cross-workspace queries possible
- OS-level file permissions

**Encryption:**
- Drive data encrypted at rest (Google's responsibility)
- Local data unencrypted (OS-level disk encryption)
- Optional: client-side encryption before upload

**Access Control:**
- Drive folder permissions = source of truth
- Local db syncs member list
- UI enforces role-based restrictions
- Backend validation not needed (Desktop app, no server)

## Alternative Patterns Considered

### Single DB with workspace_id Column

```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    title TEXT,
    ...
);
```

**Pros:**
- Single file
- Easier queries across workspaces

**Cons:**
- No isolation (bug could leak data)
- Harder to sync (one big db)
- Harder to revoke access (must delete rows)
- Not suitable for offline multi-tenant

**Verdict:** Not recommended.

### User-Level DB + Workspace JSON Files

**Pros:**
- Simpler than multiple DBs

**Cons:**
- No SQL queries on workspace data
- Harder to sync
- No CRDT support

**Verdict:** Not recommended.

## Recommendations for Fuknotion

1. **Use DB-per-workspace pattern** (isolation + sync)
2. **Store workspace list in user.db** (lightweight)
3. **Discover via Drive folder sharing** (serverless)
4. **Sync workspace DBs independently** (parallel)
5. **Role-based UI restrictions** (owner/editor/viewer)
6. **Check membership on sync** (security)
7. **Lazy load inactive workspaces** (performance)
8. **Support workspace switching** (UI requirement)

## Implementation Phases

**Phase 1: Single Workspace (MVP)**
- No multi-tenant yet
- User has one default workspace
- Proves architecture

**Phase 2: Multi-Workspace**
- Add workspaces table to user.db
- Support creating multiple workspaces
- User is owner of all their workspaces

**Phase 3: Collaboration**
- Implement Drive folder sharing
- Discover shared workspaces
- Role-based access control

**Phase 4: Advanced**
- Invitation system (if server added)
- Workspace templates
- Archive/restore

## References

- Multi-tenant patterns: https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models
- SQLite multi-db: https://www.sqlite.org/lang_attach.html
- Drive sharing API: https://developers.google.com/drive/api/v3/about-permissions

## Unresolved Questions

- Should workspace discovery be automatic or require user action?
- How to handle workspace name conflicts (two workspaces named "Work")?
- Limit on number of workspaces per user?
