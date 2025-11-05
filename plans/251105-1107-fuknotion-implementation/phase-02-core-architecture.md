# Phase 02: Core Architecture

**Phase:** 02/17 | **Duration:** 3 days | **Priority:** Critical | **Status:** In Review

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

- [x] Create Zustand stores (app, UI, notes)
- [x] Setup React Router
- [x] Implement file system service (Go)
- [x] Create app data directory
- [x] Add error boundaries
- [ ] Implement event system (DEFERRED to Phase 06 - Editor autosave)
- [x] Config file management
- [x] Custom hooks (useWorkspace, useNote)
- [x] Test state persistence
- [x] Test file operations

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

## Code Review Results

**Date:** 2025-11-05
**Status:** 🟡 CONDITIONAL APPROVAL - NEEDS FIXES
**Report:** `../reports/251105-code-reviewer-phase02-to-main.md`

**Summary:**
- All success criteria met ✅
- 9/10 tasks complete (event system deferred to Phase 06)
- Build passes (TypeScript strict + Go compilation)
- 2 HIGH priority security/robustness fixes required before Phase 03

**Required Fixes:**
1. **H1:** Path validation - implement absolute path verification to prevent directory traversal
2. **H2:** Add nil context guards to Startup method

**Post-Fix:** Phase approved for completion

## Next Steps

1. Address H1 and H2 fixes (estimated 30-45 min)
2. Manual smoke test (routing, file operations)
3. Mark phase complete
4. Proceed to Phase 03: Authentication & User Management
