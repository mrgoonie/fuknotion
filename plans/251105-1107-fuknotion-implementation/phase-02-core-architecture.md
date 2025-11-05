# Phase 02: Core Architecture

**Phase:** 02/17 | **Duration:** 3 days | **Priority:** Critical | **Status:** Pending

## Context

- **Parent:** `plan.md` | **Dependencies:** Phase 01 | **Next:** Phase 03
- **Research:** All reports in `../reports/`

## Overview

Implement state management, routing, file system layer, app lifecycle management. Foundation for all features.

## Key Insights

- Zustand for lightweight state (no Redux complexity)
- Keep UI state in React, persistent data in Go
- File system operations in Go (reliable across platforms)
- Event system for backend → frontend updates

## Requirements

**Functional:**
- State management working across components
- Routing between views (notes, settings, etc)
- File system operations (read/write/delete)
- App lifecycle hooks (startup, shutdown)

**Non-Functional:**
- State updates under 16ms (60fps)
- File operations async (non-blocking UI)
- Error handling with user-friendly messages

## Architecture

**Frontend State:**
```tsx
// stores/appStore.ts
interface AppState {
  currentWorkspace: Workspace | null
  currentNote: Note | null
  openNotes: Note[]  // Tabs
  setWorkspace: (ws: Workspace) => void
  setNote: (note: Note) => void
}

// stores/uiStore.ts
interface UIState {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleLeftSidebar: () => void
}
```

**Backend Services:**
```go
// internal/filesystem/service.go
type FileSystem struct {
    basePath string
}
func (fs *FileSystem) ReadFile(path string) ([]byte, error)
func (fs *FileSystem) WriteFile(path string, data []byte) error
func (fs *FileSystem) DeleteFile(path string) error
func (fs *FileSystem) ListFiles(dir string) ([]string, error)

// internal/app/app.go (extended)
func (a *App) GetAppDataPath() string
func (a *App) ReadFile(path string) (string, error)
func (a *App) WriteFile(path string, content string) error
```

## Related Files

**Create:**
- `frontend/src/stores/appStore.ts`
- `frontend/src/stores/uiStore.ts`
- `frontend/src/hooks/useWorkspace.ts`
- `frontend/src/hooks/useNote.ts`
- `frontend/src/router.tsx`
- `backend/internal/filesystem/service.go`
- `backend/internal/config/config.go`

## Implementation Steps

1. **Setup Zustand Stores** - App state, UI state, note state
2. **Implement Routing** - React Router with views (Editor, Settings)
3. **File System Service** - Go backend with cross-platform paths
4. **App Data Path** - `~/.fuknotion/` with proper permissions
5. **Error Boundaries** - Catch React errors gracefully
6. **Event System** - Backend emits events, frontend listens
7. **Config Management** - App settings in JSON config file

## Todo List

- [ ] Create Zustand stores (app, UI, notes)
- [ ] Setup React Router
- [ ] Implement file system service (Go)
- [ ] Create app data directory
- [ ] Add error boundaries
- [ ] Implement event system
- [ ] Config file management
- [ ] Custom hooks (useWorkspace, useNote)
- [ ] Test state persistence
- [ ] Test file operations

## Success Criteria

- State updates across components
- Routing works without page reload
- Files read/write to `~/.fuknotion/`
- App data persists between sessions
- Errors handled gracefully

## Risk Assessment

**Risk:** State synchronization bugs
**Mitigation:** Single source of truth, immutable updates

**Risk:** File system permission issues
**Mitigation:** Request permissions on startup, handle gracefully

## Security

- Validate all file paths (prevent directory traversal)
- Sanitize user input before file operations
- App data folder with restricted permissions (0700)

## Next Steps

Phase 03: Authentication & User Management
