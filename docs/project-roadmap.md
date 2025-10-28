# Fuknotion Project Roadmap

**Version:** 1.0
**Created:** 2025-10-29
**Target Completion:** Week 12 (2026-01-20)
**Status:** Phase 0 Complete ✅

---

## Executive Summary

Fuknotion is Notion-like desktop note app (Wails + React + Go) with offline-first SQLite database, Google Drive sync, block-based editor (BlockNote). 12-week MVP timeline with 1 developer. Phase 0 complete (project setup, database, dependencies). Next: Phase 1 UI infrastructure.

**Key Metrics:**
- Timeline: 12 weeks
- Phases: 0-6 (setup → polish)
- Current: Phase 0 ✅ Complete
- Next Milestone: Phase 1 (Week 3)

---

## Current Status: Phase 0 Complete ✅

**Completed:** 2025-10-29
**Duration:** Week 1

### Achievements

✅ **Project Infrastructure:**
- Wails v2 initialized with React TypeScript template
- Go 1.22 backend structure (app.go, main.go)
- Frontend dependencies installed (React 18, TypeScript)

✅ **Backend Foundation:**
- SQLite database with modernc.org/sqlite (CGO-free)
- Database migrations in `/backend/database/database.go`
- Data models: Note, Workspace, Member
- Note CRUD operations (create, read, update, delete, favorite)
- Workspace CRUD operations
- Database location: `~/.fuknotion/fuknotion.db`
- WAL mode enabled for concurrent reads

✅ **Frontend Setup:**
- TailwindCSS 4.1.16 configured
- shadcn/ui components ready (not yet added)
- Design system variables in config
- Vite 3.0.7 with HMR working
- Dependencies installed:
  - BlockNote 0.41.1
  - Zustand 5.0.8
  - Framer Motion 12.23.24
  - Lucide React 0.548.0
  - @dnd-kit (drag-drop)

✅ **Development Environment:**
- `wails dev` command working
- Hot reload functional
- Cross-platform build tested
- Git repository initialized

### Test Status

✅ Database creates at `~/.fuknotion/fuknotion.db`
✅ Default workspace "My Workspace" auto-created on first launch
✅ Note CRUD operations functional via Go methods
✅ Wails bindings auto-generated in `/frontend/wailsjs/`
✅ Frontend dependencies installed without errors
✅ TailwindCSS applies styles correctly

### Known Issues

⚠️ No frontend UI implemented yet (blank page)
⚠️ No Zustand stores created
⚠️ BlockNote editor not integrated
⚠️ shadcn/ui components not added
⚠️ No TitleBar, Sidebar, or Editor components

### Architecture Review

**Backend Structure:**
```
backend/
├── database/
│   ├── database.go    ✅ DB init, migrations, WAL mode
│   ├── notes.go       ✅ CRUD operations
│   └── workspaces.go  ✅ Workspace management
├── models/
│   └── types.go       ✅ Note, Workspace models
├── app.go             ✅ Wails lifecycle, exposed methods
└── main.go            ✅ Entry point
```

**Database Schema:**
```sql
✅ workspaces (id, name, created_at, updated_at)
✅ notes (id, workspace_id, title, content, parent_id, is_favorite, is_deleted, created_at, updated_at, deleted_at)
✅ workspace_members (workspace_id, user_id, role) - table exists, not used yet
✅ Indexes: workspace_id, parent_id, is_deleted
✅ Foreign key constraints
```

**Frontend Structure:**
```
frontend/
├── src/
│   ├── App.tsx        ⚠️ Basic template only
│   ├── components/    ⚠️ Empty (needs Sidebar, Editor, Tabs)
│   ├── stores/        ⚠️ Empty (needs noteStore, workspaceStore)
│   └── styles/
│       └── globals.css ✅ TailwindCSS configured
├── wailsjs/           ✅ Auto-generated bindings
└── package.json       ✅ All dependencies installed
```

---

## Roadmap Timeline

### Gantt Chart Overview

```
Phase 0: Setup                   [████████████████] ✅ Week 1 COMPLETE
Phase 1: Core UI                 [                ] 🔵 Weeks 2-3 (IN PROGRESS)
Phase 2: Editor Foundation       [                ] ⚪ Weeks 3-5
Phase 3: UI Components           [                ] ⚪ Weeks 5-7
Phase 4: Advanced Editor         [                ] ⚪ Weeks 7-9
Phase 5: Sync & Multi-Tenant     [                ] ⚪ Weeks 9-11
Phase 6: Polish & Testing        [                ] ⚪ Weeks 11-12
```

**Legend:**
- ✅ Complete
- 🔵 In Progress
- ⚪ Pending
- ❌ Blocked

---

## Phase 1: Core UI Infrastructure

**Status:** 🔵 IN PROGRESS
**Timeline:** Weeks 2-3 (Nov 4-15, 2025)
**Progress:** 0%
**Dependencies:** Phase 0 ✅

### Objectives

Build basic UI layout with sidebar navigation, editor integration, tab system, theme toggle. Users should be able to see notes list, click to open, edit content with auto-save.

### Tasks

| Task | Status | Assignee | Estimated | Files |
|------|--------|----------|-----------|-------|
| Create TitleBar component (window controls) | ⚪ Pending | Dev | 4h | `frontend/src/components/TitleBar.tsx` |
| Create Sidebar component (search, note list) | ⚪ Pending | Dev | 8h | `frontend/src/components/Sidebar.tsx` |
| Integrate BlockNote editor (basic) | ⚪ Pending | Dev | 8h | `frontend/src/components/Editor.tsx` |
| Create Zustand noteStore | ⚪ Pending | Dev | 4h | `frontend/src/stores/noteStore.ts` |
| Create Zustand workspaceStore | ⚪ Pending | Dev | 2h | `frontend/src/stores/workspaceStore.ts` |
| Implement auto-save with debounce | ⚪ Pending | Dev | 4h | `frontend/src/hooks/useAutoSave.ts` |
| Create TabBar component | ⚪ Pending | Dev | 6h | `frontend/src/components/Tabs/TabBar.tsx` |
| Add theme toggle (light/dark) | ⚪ Pending | Dev | 4h | `frontend/src/components/ThemeToggle.tsx` |
| Install shadcn/ui components | ⚪ Pending | Dev | 2h | CLI: `npx shadcn@latest add button dialog dropdown-menu` |

**Total Estimated:** 42 hours (~1.5 weeks)

### Acceptance Criteria

- [ ] Sidebar displays notes from database
- [ ] Click note in sidebar → opens in editor
- [ ] Edit content → auto-saves after 2s debounce
- [ ] Tab system works (open, close, switch tabs)
- [ ] Theme toggle switches light/dark mode
- [ ] Window controls (minimize, maximize, close) work
- [ ] App loads without errors
- [ ] Hot reload works during development

### Deliverables

**Files Created:**
- `/frontend/src/components/TitleBar.tsx`
- `/frontend/src/components/Sidebar/Sidebar.tsx`
- `/frontend/src/components/Editor/Editor.tsx`
- `/frontend/src/components/Tabs/TabBar.tsx`
- `/frontend/src/components/ThemeToggle.tsx`
- `/frontend/src/stores/noteStore.ts`
- `/frontend/src/stores/workspaceStore.ts`
- `/frontend/src/hooks/useAutoSave.ts`
- `/frontend/src/hooks/useDebounce.ts`

**Key Features:**
- Frameless window with custom title bar
- Left sidebar with note list (search, new page button)
- Basic BlockNote editor integration
- Tab bar above editor
- Light/dark theme switching
- Auto-save on content change

### Risks & Mitigations

**Risk:** BlockNote performance issues with large content
**Mitigation:** Test with 100+ block documents, implement virtual scrolling if needed (Phase 6)

**Risk:** Wails bindings not regenerating
**Mitigation:** Run `wails dev` to auto-regenerate, manual `wails generate` if needed

**Risk:** TailwindCSS classes not applying
**Mitigation:** Verify `tailwind.config.js` content paths include all component directories

### Testing Requirements

- [ ] Manual test: Create note via sidebar button
- [ ] Manual test: Edit note content, verify auto-save after 2s
- [ ] Manual test: Open multiple tabs, switch between them
- [ ] Manual test: Toggle theme, verify all components update
- [ ] Manual test: Minimize, maximize, close window controls work
- [ ] Manual test: Disconnect WiFi, verify app still works (offline-first)

---

## Phase 2: Editor Foundation

**Status:** ⚪ PENDING
**Timeline:** Weeks 3-5 (Nov 11-29, 2025)
**Progress:** 0%
**Dependencies:** Phase 1 (partial overlap Week 3)

### Objectives

Full BlockNote integration with all block types (headings, lists, code, callouts), slash command menu, mini floating toolbar, markdown serialization, drag-drop reordering.

### Tasks

| Task | Status | Estimated | Files |
|------|--------|-----------|-------|
| Configure BlockNote with all default blocks | ⚪ Pending | 4h | `frontend/src/components/Editor/Editor.tsx` |
| Add slash command menu (/) | ⚪ Pending | 4h | BlockNote built-in |
| Add mini toolbar (text selection) | ⚪ Pending | 6h | `frontend/src/components/Editor/MiniToolbar.tsx` |
| Implement markdown serialization | ⚪ Pending | 6h | `backend/markdown/parser.go` (Goldmark) |
| Add drag-drop block reordering | ⚪ Pending | 4h | BlockNote built-in (enable sideMenu) |
| Add title editing with auto-save | ⚪ Pending | 4h | `frontend/src/pages/EditorPage.tsx` |
| Add block folding (headings collapse) | ⚪ Pending | 6h | Custom BlockNote extension |
| Test markdown round-trip (edit → save → load) | ⚪ Pending | 4h | Manual + automated tests |

**Total Estimated:** 38 hours (~1.5 weeks)

### Acceptance Criteria

- [ ] All block types work (text, heading, list, code, callout, table)
- [ ] Typing `/` opens slash command menu with search
- [ ] Selecting text shows mini toolbar (bold, italic, link, code)
- [ ] Drag block handle (6-dot icon) → reorders blocks
- [ ] Markdown saves correctly to database
- [ ] Markdown loads correctly from database (round-trip preserves format)
- [ ] Title editable with auto-save
- [ ] Heading blocks have collapse/expand toggle

### Deliverables

**Files Created:**
- `/backend/markdown/parser.go` (Goldmark configuration)
- `/frontend/src/components/Editor/MiniToolbar.tsx`
- `/frontend/src/pages/EditorPage.tsx`
- `/frontend/src/hooks/useDebounce.ts`

**Key Features:**
- Full BlockNote editor (15+ block types)
- Slash command menu for quick insertion
- Mini floating toolbar on text selection
- Markdown serialization (editor ↔ database)
- Drag-drop block reordering
- Editable title with auto-save
- Block folding (collapse headings)

### Risks & Mitigations

**Risk:** Markdown round-trip loses formatting
**Mitigation:** Use BlockNote's built-in serializers, test extensively with complex documents

**Risk:** Custom block types break serialization
**Mitigation:** Defer custom blocks to Phase 4, use defaults first

### Testing Requirements

- [ ] Create document with all block types
- [ ] Save, close, reopen → verify format preserved
- [ ] Test slash command for each block type
- [ ] Test mini toolbar (bold, italic, link, code)
- [ ] Test drag-drop reordering (5+ blocks)
- [ ] Test title auto-save with special characters

---

## Phase 3: UI Components

**Status:** ⚪ PENDING
**Timeline:** Weeks 5-7 (Nov 25 - Dec 13, 2025)
**Progress:** 0%
**Dependencies:** Phase 2

### Objectives

Polish sidebar with drag-drop reorder, nested folders, search modal (⌘K), settings panel, keyboard shortcuts, empty states, loading skeletons.

### Tasks

| Task | Status | Estimated | Files |
|------|--------|-----------|-------|
| Sidebar drag-drop reorder pages | ⚪ Pending | 6h | `frontend/src/components/Sidebar/Sidebar.tsx` |
| Nested folders (parent_id hierarchy) | ⚪ Pending | 8h | `frontend/src/components/Sidebar/PageTree.tsx` |
| Search modal (⌘K) | ⚪ Pending | 6h | `frontend/src/components/SearchModal.tsx` |
| Settings panel (theme, shortcuts, about) | ⚪ Pending | 8h | `frontend/src/components/Settings.tsx` |
| Keyboard shortcuts (⌘B, ⌘I, ⌘K, etc.) | ⚪ Pending | 6h | Global event listeners |
| Empty states (no notes, no results) | ⚪ Pending | 4h | UI components |
| Loading states (skeletons) | ⚪ Pending | 4h | Skeleton components |
| Favorites section in sidebar | ⚪ Pending | 4h | Query notes where is_favorite=1 |
| Trash view (soft-deleted notes) | ⚪ Pending | 6h | Query notes where is_deleted=1 |

**Total Estimated:** 52 hours (~2 weeks)

### Acceptance Criteria

- [ ] Drag-drop notes in sidebar → reorder persists
- [ ] Nested pages display correctly (indent, expand/collapse)
- [ ] Pressing ⌘K opens search modal
- [ ] Search modal searches title + content (<200ms)
- [ ] All keyboard shortcuts documented and working
- [ ] Empty states show helpful messages
- [ ] Loading skeletons appear during data fetch
- [ ] Favorites section shows starred notes
- [ ] Trash view shows deleted notes with restore button

### Deliverables

**Files Created:**
- `/frontend/src/components/Sidebar/PageTree.tsx`
- `/frontend/src/components/SearchModal.tsx`
- `/frontend/src/components/Settings.tsx`
- `/frontend/src/components/EmptyState.tsx`
- `/frontend/src/components/Skeleton.tsx`
- `/backend/database/search.go` (FTS5 full-text search)

**Key Features:**
- Drag-drop sidebar reordering
- Nested page hierarchy (folders)
- Global search modal (⌘K)
- Settings panel
- Keyboard shortcuts
- Empty/loading states
- Favorites + Trash views

### Risks & Mitigations

**Risk:** Nested folder performance with 1000+ notes
**Mitigation:** Lazy load children, virtualize list if needed

**Risk:** Search slow with large database
**Mitigation:** SQLite FTS5 index, test with 10,000 notes

### Testing Requirements

- [ ] Drag note to new position → verify order persists after reload
- [ ] Create nested pages (3+ levels) → verify hierarchy
- [ ] Search for text in note content → verify results
- [ ] Test all keyboard shortcuts (⌘K, ⌘N, ⌘B, etc.)
- [ ] Delete note → appears in trash
- [ ] Restore note from trash → appears in sidebar
- [ ] Toggle favorite → appears in favorites section

---

## Phase 4: Advanced Editor Features

**Status:** ⚪ PENDING
**Timeline:** Weeks 7-9 (Dec 9, 2025 - Jan 3, 2026)
**Progress:** 0%
**Dependencies:** Phase 3

### Objectives

Internal links (#shortcut), @ mentions, multi-column layouts, block copy formats (markdown, plain text, HTML), advanced block types.

### Tasks

| Task | Status | Estimated | Files |
|------|--------|-----------|-------|
| Internal links (#shortcut) | ⚪ Pending | 8h | Custom BlockNote inline content |
| @ Mentions (workspace members) | ⚪ Pending | 8h | Custom inline content + member query |
| Multi-column layouts (1-4 columns) | ⚪ Pending | 8h | Custom block type |
| Block copy formats (markdown, plain, HTML) | ⚪ Pending | 6h | Context menu + clipboard API |
| Code block language selector | ⚪ Pending | 4h | BlockNote built-in enhancement |
| Callout color variants | ⚪ Pending | 4h | BlockNote schema customization |
| Image/file upload handler | ⚪ Pending | 6h | Local file system integration |

**Total Estimated:** 44 hours (~2 weeks)

### Acceptance Criteria

- [ ] Typing `#` opens page link suggestion menu
- [ ] Clicking page link opens that note
- [ ] Typing `@` opens member mention menu (if members exist)
- [ ] Slash command shows "2 Columns", "3 Columns", "4 Columns"
- [ ] Right-click block → shows copy format options
- [ ] Copying as markdown preserves formatting
- [ ] Code blocks have language dropdown
- [ ] Callouts support info/warning/error/success variants
- [ ] Images upload and display inline

### Deliverables

**Files Created:**
- `/frontend/src/components/Editor/PageLinkMenu.tsx`
- `/frontend/src/components/Editor/MentionMenu.tsx`
- `/frontend/src/components/Editor/ColumnBlock.tsx`
- `/frontend/src/components/Editor/BlockContextMenu.tsx`

**Key Features:**
- Internal page links (#shortcut)
- Member mentions (@shortcut)
- Multi-column layouts
- Copy formats (markdown, plain, HTML)
- Enhanced code blocks
- Callout variants
- Image/file uploads

### Risks & Mitigations

**Risk:** Custom blocks break markdown serialization
**Mitigation:** Write custom serializers/deserializers, test round-trip

**Risk:** Performance degradation with complex layouts
**Mitigation:** Limit column nesting depth, optimize re-renders

### Testing Requirements

- [ ] Create internal link, verify click opens correct note
- [ ] Create mention, verify member info displays
- [ ] Create 2/3/4 column layout, verify responsive
- [ ] Copy block as markdown, paste in external editor
- [ ] Copy block as plain text, verify no formatting
- [ ] Upload image, verify displays and persists after reload

---

## Phase 5: Sync & Multi-Tenant

**Status:** ⚪ PENDING
**Timeline:** Weeks 9-11 (Dec 30, 2025 - Jan 17, 2026)
**Progress:** 0%
**Dependencies:** Phase 4

### Objectives

Google Drive OAuth, file upload/download, sync queue processor, background worker (5min interval), conflict resolution UI, workspace switcher, member management.

### Tasks

| Task | Status | Estimated | Files |
|------|--------|-----------|-------|
| Google OAuth 2.0 flow with PKCE | ⚪ Pending | 10h | `backend/sync/oauth.go` |
| Drive API client (upload, download, list) | ⚪ Pending | 10h | `backend/sync/drive.go` |
| Sync queue implementation | ⚪ Pending | 8h | `backend/sync/queue.go` |
| Background sync worker (5min interval) | ⚪ Pending | 6h | `backend/app.go` (goroutine) |
| Three-way merge conflict resolution | ⚪ Pending | 10h | `backend/sync/conflict.go` |
| Conflict resolution UI | ⚪ Pending | 8h | `frontend/src/components/ConflictModal.tsx` |
| Workspace switcher UI | ⚪ Pending | 6h | `frontend/src/components/WorkspaceSwitcher.tsx` |
| Member invitations (placeholder UI) | ⚪ Pending | 6h | `frontend/src/components/MemberManagement.tsx` |
| Sync status indicator | ⚪ Pending | 4h | UI component |
| Error handling + retry logic | ⚪ Pending | 6h | Exponential backoff |

**Total Estimated:** 74 hours (~2.5 weeks)

### Acceptance Criteria

- [ ] User clicks "Connect Google Drive" → OAuth flow opens browser
- [ ] User authorizes → token saved in OS keychain (not plaintext)
- [ ] User creates note → queued for upload
- [ ] Background worker uploads batch (10 notes) every 5min
- [ ] User edits same note on 2 devices → conflict detected
- [ ] Conflict UI shows diff viewer (local vs remote)
- [ ] User resolves conflict (keep local, keep remote, merge both)
- [ ] Multiple workspaces display in switcher
- [ ] Switching workspace filters notes correctly
- [ ] Sync status indicator shows: synced, syncing, error

### Deliverables

**Files Created:**
- `/backend/sync/oauth.go` (OAuth 2.0 with PKCE)
- `/backend/sync/drive.go` (Drive API client)
- `/backend/sync/queue.go` (Sync queue processor)
- `/backend/sync/conflict.go` (Three-way merge)
- `/frontend/src/components/ConflictModal.tsx`
- `/frontend/src/components/WorkspaceSwitcher.tsx`
- `/frontend/src/components/MemberManagement.tsx`

**Key Features:**
- Google Drive OAuth 2.0
- File upload/download
- Sync queue with retry logic
- Background sync worker
- Conflict resolution (three-way merge)
- Workspace management
- Member invitations

### Risks & Mitigations

**Risk:** OAuth callback fails in desktop context
**Mitigation:** Use localhost:8080 callback, test on all platforms early

**Risk:** Sync conflicts cause data loss
**Mitigation:** Always backup before merge, show conflict UI for manual resolution

**Risk:** Google Drive API rate limits
**Mitigation:** Batch operations, exponential backoff, respect quotas

**Risk:** Token storage security
**Mitigation:** Use OS keychain (Keychain Services, Credential Manager, Secret Service)

### Testing Requirements

- [ ] Complete OAuth flow on Windows, macOS, Linux
- [ ] Upload 100 notes, verify all appear in Drive
- [ ] Download notes to new device, verify all load correctly
- [ ] Edit same note on 2 devices simultaneously, verify conflict UI
- [ ] Disconnect WiFi, edit note, reconnect → verify syncs automatically
- [ ] Test sync queue retry logic (max 5 retries)
- [ ] Create 3 workspaces, verify switching filters notes correctly
- [ ] Invite member (placeholder), verify role assignment works

---

## Phase 6: Polish & Testing

**Status:** ⚪ PENDING
**Timeline:** Weeks 11-12 (Jan 13-20, 2026)
**Progress:** 0%
**Dependencies:** Phase 5

### Objectives

Performance optimization (virtual scrolling, lazy loading), accessibility audit (WCAG AA), cross-platform testing, error handling, packaging, code signing, documentation.

### Tasks

| Task | Status | Estimated | Files |
|------|--------|-----------|-------|
| Performance optimization (virtual scrolling) | ⚪ Pending | 8h | react-window integration |
| Lazy load editor component | ⚪ Pending | 4h | React.lazy + Suspense |
| SQLite indexes + FTS5 search | ⚪ Pending | 4h | `backend/database/migrations.go` |
| Accessibility audit (axe DevTools) | ⚪ Pending | 6h | Fix critical issues |
| Cross-platform testing (Win, Mac, Linux) | ⚪ Pending | 8h | Manual testing |
| Error boundaries + logging | ⚪ Pending | 6h | React error boundaries + Go logging |
| Packaging (installers) | ⚪ Pending | 6h | NSIS (Win), DMG (Mac), AppImage (Linux) |
| Code signing (Win + Mac) | ⚪ Pending | 6h | Authenticode + Apple Developer ID |
| User documentation | ⚪ Pending | 8h | Getting started, shortcuts, troubleshooting |
| Developer documentation | ⚪ Pending | 6h | Architecture, build instructions, API |
| Final QA testing | ⚪ Pending | 8h | Manual checklist |

**Total Estimated:** 70 hours (~2 weeks)

### Acceptance Criteria

- [ ] App loads in <2s on cold start
- [ ] Large documents (1000+ blocks) render without lag
- [ ] Passes axe DevTools audit (0 critical accessibility issues)
- [ ] Keyboard navigation works for all features
- [ ] Builds successfully on Windows 10/11, macOS 12+, Ubuntu 22.04+
- [ ] Installers created for all platforms (NSIS, DMG, AppImage)
- [ ] Code signed (Authenticode for Windows, Apple Developer ID for macOS)
- [ ] User documentation complete (getting started guide, shortcuts reference)
- [ ] Developer documentation complete (architecture overview, build instructions)
- [ ] Error handling prevents crashes (error boundaries, graceful degradation)

### Deliverables

**Files Created:**
- `/docs/user-guide.md` (Getting started, features, shortcuts)
- `/docs/troubleshooting.md` (Common issues, FAQ)
- `/docs/CONTRIBUTING.md` (Developer guide, build instructions)
- `/docs/CHANGELOG.md` (Version history, breaking changes)

**Key Features:**
- Performance optimizations
- Accessibility compliance (WCAG AA)
- Cross-platform builds
- Installers + code signing
- Comprehensive documentation
- Error handling + logging

### Risks & Mitigations

**Risk:** Performance issues with very large vaults
**Mitigation:** Implement pagination, lazy loading, virtual scrolling, database indexes

**Risk:** Platform-specific bugs discovered late
**Mitigation:** Test on all platforms throughout development (not just at end)

**Risk:** Code signing certificate issues
**Mitigation:** Obtain certificates early, test signing process in advance

### Testing Requirements

- [ ] Load time: App starts in <2s (cold start)
- [ ] Render time: 1000-block document renders without lag
- [ ] Accessibility: axe DevTools reports 0 critical issues
- [ ] Keyboard: Navigate entire app without mouse
- [ ] Windows: Install via NSIS, verify all features work
- [ ] macOS: Install via DMG, verify Gatekeeper allows launch (notarized)
- [ ] Linux: Install AppImage, verify all features work
- [ ] Stress test: 10,000 notes in database, verify search <200ms
- [ ] Network test: Disconnect WiFi, verify offline mode works
- [ ] Sync test: 1000 notes sync to Drive in <30s

---

## Milestones & Deliverables

### Milestone 1: Core Functionality (Week 3)

**Date:** Nov 15, 2025
**Status:** ⚪ Pending

**Demo-able Features:**
- ✅ Create, edit, delete notes
- ✅ Sidebar navigation
- ✅ Basic editor (BlockNote)
- ✅ Auto-save
- ✅ Theme toggle

**Acceptance Criteria:**
- User can create note from sidebar
- User can edit note content with auto-save
- User can switch between light/dark theme
- App works fully offline

---

### Milestone 2: Full Editor (Week 5)

**Date:** Nov 29, 2025
**Status:** ⚪ Pending

**Demo-able Features:**
- ✅ All block types (headings, lists, code, callouts, tables)
- ✅ Slash command menu
- ✅ Mini toolbar
- ✅ Markdown serialization
- ✅ Drag-drop reorder

**Acceptance Criteria:**
- User can create complex documents with all block types
- Markdown saves and loads correctly
- Drag-drop reordering works smoothly

---

### Milestone 3: Complete UI (Week 7)

**Date:** Dec 13, 2025
**Status:** ⚪ Pending

**Demo-able Features:**
- ✅ Nested folders
- ✅ Search modal (⌘K)
- ✅ Settings panel
- ✅ Keyboard shortcuts
- ✅ Favorites + Trash

**Acceptance Criteria:**
- User can organize notes in nested folders
- User can search notes quickly (⌘K)
- All keyboard shortcuts work

---

### Milestone 4: Advanced Features (Week 9)

**Date:** Jan 3, 2026
**Status:** ⚪ Pending

**Demo-able Features:**
- ✅ Internal links (#shortcut)
- ✅ @ Mentions
- ✅ Multi-column layouts
- ✅ Copy formats
- ✅ Image uploads

**Acceptance Criteria:**
- User can link between notes
- User can create multi-column layouts
- User can copy blocks in different formats

---

### Milestone 5: Sync Enabled (Week 11)

**Date:** Jan 17, 2026
**Status:** ⚪ Pending

**Demo-able Features:**
- ✅ Google Drive OAuth
- ✅ Cloud sync
- ✅ Conflict resolution
- ✅ Multiple workspaces
- ✅ Background sync

**Acceptance Criteria:**
- User can connect Google Drive account
- Notes sync automatically every 5min
- Conflicts resolved without data loss
- Multiple workspaces functional

---

### Milestone 6: Production Ready (Week 12)

**Date:** Jan 20, 2026
**Status:** ⚪ Pending

**Demo-able Features:**
- ✅ Installers for Windows, macOS, Linux
- ✅ Code signed
- ✅ Documentation complete
- ✅ Performance optimized
- ✅ Accessibility compliant

**Acceptance Criteria:**
- App loads in <2s
- Passes accessibility audit
- Installers work on all platforms
- Documentation complete

---

## Risk Assessment

### High Priority Risks

**Risk 1: BlockNote performance with large documents**
- **Impact:** High (user experience)
- **Probability:** Medium
- **Mitigation:** Implement virtual scrolling in Phase 6
- **Contingency:** Limit document size, show warning at 1000 blocks
- **Owner:** Developer
- **Status:** Monitoring

**Risk 2: Google Drive API rate limits**
- **Impact:** High (sync failures)
- **Probability:** Medium
- **Mitigation:** Batch operations, exponential backoff
- **Contingency:** Show "sync paused" message, retry later
- **Owner:** Developer
- **Status:** To address in Phase 5

**Risk 3: Sync conflicts cause data loss**
- **Impact:** Critical (data integrity)
- **Probability:** Low
- **Mitigation:** Always backup before merge, show conflict UI
- **Contingency:** User manually resolves, restore from backup
- **Owner:** Developer
- **Status:** To address in Phase 5

**Risk 4: Cross-platform build issues**
- **Impact:** High (deployment blocker)
- **Probability:** Low
- **Mitigation:** Use CGO-free dependencies, test early
- **Contingency:** Drop Linux support if critical issues
- **Owner:** Developer
- **Status:** Phase 0 ✅ tested successfully

---

### Medium Priority Risks

**Risk 5: OAuth callback fails in desktop context**
- **Impact:** Medium (sync blocker)
- **Probability:** Medium
- **Mitigation:** Use localhost:8080 callback, test thoroughly
- **Contingency:** Manual token paste as fallback
- **Owner:** Developer
- **Status:** To address in Phase 5

**Risk 6: Wails HMR not working**
- **Impact:** Low (developer experience)
- **Probability:** Low
- **Mitigation:** Follow official Vite config
- **Contingency:** Restart dev server manually
- **Owner:** Developer
- **Status:** Phase 0 ✅ working

**Risk 7: Markdown round-trip loses formatting**
- **Impact:** Medium (data integrity)
- **Probability:** Low
- **Mitigation:** Use BlockNote built-in serializers, test extensively
- **Contingency:** Store JSON blocks instead of markdown
- **Owner:** Developer
- **Status:** To address in Phase 2

**Risk 8: SQLite database corruption**
- **Impact:** Critical (data loss)
- **Probability:** Very Low
- **Mitigation:** WAL mode, integrity checks, backups
- **Contingency:** Restore from Google Drive sync
- **Owner:** Developer
- **Status:** Monitoring

---

### Timeline Risks

**Risk 9: Scope creep (adding unplanned features)**
- **Impact:** High (timeline slip)
- **Probability:** Medium
- **Mitigation:** Strict adherence to MVP scope, defer extras to Phase 7
- **Contingency:** Cut Phase 4 features if timeline at risk
- **Owner:** Product Manager
- **Status:** Monitoring

**Risk 10: Underestimated task complexity**
- **Impact:** Medium (timeline slip)
- **Probability:** Medium
- **Mitigation:** Buffer time in estimates, regular progress reviews
- **Contingency:** Extend timeline by 1-2 weeks
- **Owner:** Developer
- **Status:** Monitoring

---

### Resource Risks

**Risk 11: Single developer dependency**
- **Impact:** High (project blocker)
- **Probability:** Low
- **Mitigation:** Clear documentation, knowledge sharing
- **Contingency:** Delay timeline if developer unavailable
- **Owner:** Product Manager
- **Status:** Monitoring

**Risk 12: Third-party dependency issues**
- **Impact:** Medium (development blocker)
- **Probability:** Low
- **Mitigation:** Pin dependency versions, review changelogs
- **Contingency:** Fork/patch dependency, find alternative
- **Owner:** Developer
- **Status:** Monitoring

---

## Success Metrics

### MVP Success Criteria (Week 12)

**Functional Requirements:**
- ✅ User can create, edit, delete notes offline
- ✅ Notes sync to Google Drive automatically
- ✅ Conflicts resolved without data loss
- ✅ Supports 1,000+ notes per workspace without lag

**Performance Targets:**
- App launch: <2s (cold start)
- Note open: <100ms
- Auto-save: <50ms
- Full sync (1000 notes): <30s
- Search (10,000 notes): <200ms

**Quality Targets:**
- 0 critical accessibility issues (WCAG AA)
- 0 crash bugs in production
- <5% sync error rate
- Builds successfully on Windows/macOS/Linux

**Adoption Metrics (Post-Launch):**
- 100+ beta testers
- >80% satisfaction score
- <10% churn rate (first month)

---

## Next Steps After MVP (Phase 7+)

**Post-MVP Backlog:**
1. Database blocks (tables, boards, calendars)
2. Templates system (predefined note structures)
3. AI integration (summarization, generation, chat)
4. Version history with snapshots
5. Export formats (PDF, HTML, Obsidian)
6. Mobile apps (React Native)
7. Real-time collaboration (CRDT with Yjs)
8. Public sharing with custom domains
9. API for third-party integrations
10. Plugin marketplace (WebAssembly plugins)

**Priority for Phase 7 (Weeks 13-16):**
- Templates system (high demand)
- Export to PDF/HTML (requested by writers)
- Version history (safety feature)

---

## Changelog

### Version 1.0 (2025-10-29)

**Added:**
- Initial project roadmap
- Phase 0-6 detailed task breakdown
- Milestone definitions
- Risk assessment
- Success metrics
- Gantt chart timeline

**Status:**
- Phase 0 Complete ✅
- Phase 1 Ready to Start 🔵

---

## Unresolved Questions

1. **Real-time Collaboration:** Is simultaneous multi-user editing required? Impacts CRDT complexity (current plan: async sync only)

2. **End-to-End Encryption:** Should files be encrypted at rest locally and before uploading? Impacts search performance (current plan: no encryption for MVP)

3. **Mobile Apps:** Are iOS/Android versions planned? Wails is desktop-only (would need separate React Native app)

4. **Plugin System:** Will users create custom block types or extensions? Requires plugin architecture (current plan: not for MVP)

5. **Version History:** Is Notion-like version history required? Needs snapshot storage strategy (current plan: not for MVP)

6. **Data Residency:** Any GDPR/SOC2 compliance requirements? Impacts logging, encryption (current plan: no compliance requirements)

7. **Monetization:** Free/open-source or commercial? Impacts license choices (current plan: MIT license, free)

8. **AI Integration:** Which features (summarization, generation)? Which LLM provider? (current plan: defer to Phase 7)

9. **Export Formats:** Beyond Markdown, which formats priority (PDF, HTML, JSON, Obsidian)? (current plan: defer to Phase 7)

10. **Team Size:** Will team expand? Current plan assumes 1 developer (adjust timeline +30% for team coordination)

---

**Document Version:** 1.0
**Created:** 2025-10-29
**Last Updated:** 2025-10-29
**Status:** Phase 0 Complete ✅
**Next Action:** Begin Phase 1 (Core UI Infrastructure) - Week 2
