# Fuknotion - Project Overview & Product Development Requirements

**Version:** 1.0
**Created:** 2025-10-28
**Last Updated:** 2025-10-29
**Status:** Phase 0 Complete, Ready for Phase 1

---

## Executive Summary

Fuknotion is a Notion-like desktop note-taking application built for Windows and macOS using Wails v2 (Go + React). The app prioritizes offline-first architecture, fast performance, and keyboard-driven workflows. Core value proposition: Notion's powerful block-based editing combined with local-first data control and native desktop performance.

**Target Users:** Developers, writers, knowledge workers seeking offline-first note-taking with Notion-like UX.

**Development Timeline:** 12 weeks MVP (1 developer), currently Phase 0 complete.

**Tech Stack:** Go 1.22, React 18, TypeScript, BlockNote, SQLite (modernc.org), TailwindCSS, Zustand.

---

## Product Vision

### Problem Statement

Existing note-taking apps have critical limitations:
- **Notion:** Cloud-only, slow offline support, privacy concerns
- **Obsidian:** Plain markdown only, no WYSIWYG editing
- **OneNote:** Proprietary format, poor markdown support
- **Apple Notes:** Platform-locked, limited formatting

### Solution

Fuknotion combines:
- Notion's block-based WYSIWYG editor
- Obsidian's offline-first architecture
- Native desktop performance
- Optional Google Drive sync for backup
- Cross-platform (Windows, macOS, Linux)

### Success Metrics (MVP)

**Functional:**
- User can create, edit, delete notes offline
- Notes sync to Google Drive when online
- Supports 1,000+ notes without lag
- Conflicts resolved without data loss

**Performance:**
- App launch: <2s
- Note open: <100ms
- Auto-save: <50ms
- Full sync (1000 notes): <30s

**Quality:**
- 0 critical accessibility issues (WCAG AA)
- 0 crash bugs
- <5% sync error rate
- Builds successfully on Windows/macOS/Linux

---

## Core Features (MVP)

### 1. Block-Based Editor

**Description:** Notion-like WYSIWYG markdown editor using BlockNote library.

**Functional Requirements:**
- FR-E-001: Support paragraph, heading (H1-H3), bulleted list, numbered list, checklist blocks
- FR-E-002: Support code block with syntax highlighting
- FR-E-003: Support callout blocks (info, warning, error, success)
- FR-E-004: Support quote, divider, table blocks
- FR-E-005: Support image, video, audio, file blocks
- FR-E-006: Slash command menu (/) to insert blocks
- FR-E-007: Mini floating toolbar on text selection (bold, italic, underline, link, code)
- FR-E-008: Drag-drop blocks to reorder
- FR-E-009: Auto-save with 2s debounce
- FR-E-010: Markdown export/import

**Acceptance Criteria:**
- ✅ User types `/` → slash command menu appears
- ✅ User selects text → mini toolbar appears above selection
- ✅ User drags block handle → block moves to new position
- ✅ User edits content → auto-saves after 2s
- ✅ All markdown syntax renders correctly (GFM)

**Non-Functional Requirements:**
- Large documents (1000 blocks) render without lag
- Undo/redo works correctly (BlockNote built-in)
- Keyboard shortcuts for common actions (⌘B, ⌘I, ⌘K)

---

### 2. Multi-Workspace Support

**Description:** Organize notes into workspaces with member collaboration (Phase 5).

**Functional Requirements:**
- FR-W-001: Create workspace with name
- FR-W-002: Switch between workspaces
- FR-W-003: Rename/delete workspace
- FR-W-004: Default workspace created on first launch
- FR-W-005: Each workspace has isolated notes
- FR-W-006: Invite members via email (Phase 5)
- FR-W-007: Assign roles: owner, editor, viewer (Phase 5)

**Acceptance Criteria:**
- ✅ User creates workspace → appears in workspace list
- ✅ User switches workspace → notes filtered to workspace
- ✅ User deletes workspace → notes soft-deleted
- ✅ First launch creates "My Workspace" automatically

---

### 3. Sidebar Navigation

**Description:** Left sidebar with search, quick actions, nested folders, favorites, trash.

**Functional Requirements:**
- FR-S-001: Search bar filters notes by title
- FR-S-002: New page button creates untitled note
- FR-S-003: Favorites section shows starred notes
- FR-S-004: Workspace section shows nested hierarchy
- FR-S-005: Drag-drop to reorder pages
- FR-S-006: Drag-drop to move page into folder
- FR-S-007: Expand/collapse folders
- FR-S-008: Settings button opens settings panel
- FR-S-009: Trash button shows deleted notes
- FR-S-010: Sidebar collapsible to icon-only mode

**Acceptance Criteria:**
- ✅ User types in search → notes filtered instantly
- ✅ User clicks new page → blank note created
- ✅ User drags page into folder → becomes child
- ✅ User clicks collapse → sidebar shrinks to 48px

---

### 4. Tab System

**Description:** Open multiple notes in tabs with drag-to-reorder.

**Functional Requirements:**
- FR-T-001: Click note in sidebar → opens in new tab
- FR-T-002: Middle-click tab → closes tab
- FR-T-003: Drag tab → reorder tabs
- FR-T-004: Unsaved indicator (blue dot) if edited
- FR-T-005: Close button appears on hover
- FR-T-006: Keyboard shortcuts (⌘1-9 to switch)
- FR-T-007: Reopen closed tab (⌘⇧T)

**Acceptance Criteria:**
- ✅ User clicks note → tab opens
- ✅ User drags tab → position changes
- ✅ User edits note → blue dot appears
- ✅ User presses ⌘W → tab closes

---

### 5. Offline-First Architecture

**Description:** Local SQLite database as source of truth, works fully offline.

**Functional Requirements:**
- FR-O-001: All notes stored in SQLite (~/.fuknotion/fuknotion.db)
- FR-O-002: CRUD operations work without internet
- FR-O-003: WAL mode for concurrent reads
- FR-O-004: Soft delete pattern (trash recovery)
- FR-O-005: UUID-based IDs (not auto-increment)
- FR-O-006: Timestamps (created_at, updated_at) on all entities

**Acceptance Criteria:**
- ✅ User disconnects WiFi → app still works
- ✅ User creates note offline → saved locally
- ✅ User deletes note → moves to trash (not removed)
- ✅ Database corrupted → app shows error, doesn't crash

**Non-Functional Requirements:**
- Database size: supports 100,000+ notes
- Query performance: <50ms for list operations
- Backup strategy: user can export database file

---

### 6. Google Drive Sync (Phase 5)

**Description:** Optional cloud backup with conflict resolution.

**Functional Requirements:**
- FR-G-001: OAuth 2.0 authentication with Google
- FR-G-002: Upload notes as markdown files to Drive
- FR-G-003: Download notes from Drive on new device
- FR-G-004: Sync queue for offline changes
- FR-G-005: Three-way merge conflict resolution
- FR-G-006: Manual sync trigger (auto-sync every 5min)
- FR-G-007: Sync status indicator (synced, syncing, error)

**Acceptance Criteria:**
- ✅ User clicks "Sync" → OAuth flow opens browser
- ✅ User authorizes → token saved securely
- ✅ User creates note → queued for upload
- ✅ User edits same note on 2 devices → conflict UI shown
- ✅ Background sync runs every 5min when online

**Non-Functional Requirements:**
- Sync batch size: 10 notes per batch
- Retry logic: exponential backoff (max 5 retries)
- Rate limiting: respect Google Drive API quotas

---

### 7. Themes & Appearance

**Description:** Light and dark mode with warm color palette.

**Functional Requirements:**
- FR-A-001: Toggle between light, dark, system themes
- FR-A-002: Theme persists in localStorage
- FR-A-003: System theme changes auto-update app
- FR-A-004: Smooth transition between themes (200ms)
- FR-A-005: All components support both themes

**Acceptance Criteria:**
- ✅ User toggles theme → app updates instantly
- ✅ User sets system theme → app respects preference
- ✅ No flash of wrong theme on load

**Design Tokens:** See `design-guidelines.md` for full color system.

---

### 8. Search (Phase 3)

**Description:** Fast full-text search with Cmd+K command palette.

**Functional Requirements:**
- FR-SE-001: Global search (⌘K) searches all notes
- FR-SE-002: Search by title and content
- FR-SE-003: Fuzzy matching for typos
- FR-SE-004: Show breadcrumb (workspace > folder > note)
- FR-SE-005: Recent searches saved
- FR-SE-006: Keyboard navigation (arrows, Enter)

**Acceptance Criteria:**
- ✅ User types query → results appear <100ms
- ✅ User presses ⌘K → search modal opens
- ✅ User selects result → note opens in tab

**Non-Functional Requirements:**
- SQLite FTS5 full-text index
- Incremental indexing on save
- Search performance: <200ms for 10,000 notes

---

## Technical Requirements

### Platform Support

**Primary:**
- Windows 10/11 (x64)
- macOS 12+ (Intel, Apple Silicon)

**Secondary (Future):**
- Linux (Ubuntu 22.04+, Fedora 38+)

### System Requirements

**Minimum:**
- RAM: 512MB
- Storage: 100MB + user data
- Display: 1024x768

**Recommended:**
- RAM: 2GB
- Storage: 500MB + user data
- Display: 1920x1080

### Technology Stack

**Backend:**
- Go 1.22+ (cross-platform, fast, simple)
- Wails v2.10+ (desktop framework)
- modernc.org/sqlite v1.29+ (CGO-free SQLite)
- Goldmark v1.7+ (markdown parser)
- Google Drive API v3 (sync)

**Frontend:**
- React 18.2+ (UI library)
- TypeScript 4.6+ (type safety)
- BlockNote 0.41+ (editor)
- TailwindCSS 4.1+ (styling)
- Zustand 5.0+ (state management)
- Framer Motion 12.23+ (animations)
- Lucide React 0.548+ (icons)
- @dnd-kit (drag-drop)

**Build Tools:**
- Vite 3.0+ (fast dev server, HMR)
- Wails CLI (app bundling, code signing)

### Data Storage

**Local:**
- Database: `~/.fuknotion/fuknotion.db` (SQLite WAL mode)
- Config: localStorage (theme, recent files)
- OAuth tokens: OS keychain (macOS Keychain, Windows Credential Manager)

**Cloud (Phase 5):**
- Google Drive folder: `/Fuknotion/`
- File format: Markdown (.md)
- Metadata: JSON frontmatter (ID, timestamps)

### Security Requirements

**Current (Phase 0-4):**
- No authentication (local-only app)
- No encryption (SQLite plaintext)
- No network access

**Future (Phase 5):**
- OAuth 2.0 with PKCE flow
- OAuth tokens in OS keychain (not plaintext)
- Optional E2E encryption for cloud sync (TBD)

### Accessibility Requirements

**WCAG 2.1 AA Compliance:**
- Keyboard navigation for all features
- Focus indicators visible (2px ring)
- Color contrast 4.5:1 (text), 3:1 (UI components)
- Screen reader support (ARIA labels, semantic HTML)
- Reduced motion support (prefers-reduced-motion)

**Keyboard Shortcuts:**
- Global: ⌘K (search), ⌘N (new page), ⌘B (sidebar)
- Editor: ⌘B (bold), ⌘I (italic), ⌘K (link)
- Tabs: ⌘1-9 (switch), ⌘W (close), ⌘⇧T (reopen)

---

## Development Phases

### Phase 0: Setup ✅ Complete (Week 1)

**Deliverables:**
- ✅ Wails v2 project initialized
- ✅ Go backend structure (database, models)
- ✅ SQLite database with migrations
- ✅ Note CRUD operations
- ✅ Frontend dependencies installed
- ✅ TailwindCSS configured
- ✅ Vite HMR working

**Status:** Complete (2025-10-29)

---

### Phase 1: Core UI Infrastructure (Weeks 2-3)

**Objectives:** Build basic UI layout with sidebar, editor placeholder, tabs.

**Tasks:**
1. Create TitleBar component (window controls)
2. Create Sidebar component (search, new page, note list)
3. Integrate BlockNote editor (basic)
4. Create Zustand stores (noteStore, workspaceStore)
5. Implement auto-save with debounce
6. Create TabBar component
7. Add theme toggle (light/dark)

**Acceptance Criteria:**
- ✅ Sidebar displays notes from database
- ✅ Click note → opens in editor
- ✅ Edit content → auto-saves after 2s
- ✅ Tab system works (open, close, switch)
- ✅ Theme toggle works

**Timeline:** 2 weeks (Weeks 2-3)

---

### Phase 2: Editor Foundation (Weeks 3-5)

**Objectives:** Full BlockNote integration with all block types.

**Tasks:**
1. Configure BlockNote with all default blocks
2. Add slash command menu (/)
3. Add mini toolbar (text selection)
4. Implement markdown serialization
5. Add drag-drop block reordering
6. Add title editing with auto-save
7. Add block folding (headings)

**Acceptance Criteria:**
- ✅ All block types work (text, heading, list, code, etc.)
- ✅ Slash commands work
- ✅ Mini toolbar appears on selection
- ✅ Drag-drop blocks works
- ✅ Markdown round-trip preserves formatting

**Timeline:** 2 weeks (Weeks 4-5, overlaps with Phase 1)

---

### Phase 3: UI Components (Weeks 5-7)

**Objectives:** Polish sidebar, tabs, search, settings.

**Tasks:**
1. Sidebar drag-drop (reorder pages)
2. Nested folders (parent_id hierarchy)
3. Search modal (⌘K)
4. Settings panel (theme, shortcuts, about)
5. Keyboard shortcuts
6. Empty states (no notes, no results)
7. Loading states (skeletons)

**Acceptance Criteria:**
- ✅ Drag-drop reorder works
- ✅ Nested pages display correctly
- ✅ Search modal works (⌘K)
- ✅ All keyboard shortcuts work
- ✅ Empty states look polished

**Timeline:** 2 weeks (Weeks 6-7)

---

### Phase 4: Advanced Editor (Weeks 7-9)

**Objectives:** Internal links, mentions, columns, copy formats.

**Tasks:**
1. Internal links (#shortcut)
2. Member mentions (@shortcut) - Phase 5
3. Multi-column layouts (1-4 columns)
4. Block copy formats (markdown, plain text, HTML)
5. Code block language selector
6. Callout color variants

**Acceptance Criteria:**
- ✅ # shortcut opens page link menu
- ✅ @ shortcut opens mention menu
- ✅ Columns work via slash command
- ✅ Copy formats work

**Timeline:** 2 weeks (Weeks 8-9)

---

### Phase 5: Sync & Multi-Tenant (Weeks 9-11)

**Objectives:** Google Drive sync, workspaces, permissions.

**Tasks:**
1. Google OAuth 2.0 flow
2. Drive API client (upload, download)
3. Sync queue implementation
4. Background sync worker (5min interval)
5. Conflict resolution UI
6. Workspace switcher
7. Member invitations (placeholder)

**Acceptance Criteria:**
- ✅ OAuth flow completes
- ✅ Notes upload to Drive
- ✅ Background sync runs every 5min
- ✅ Conflicts detected and resolved
- ✅ Multiple workspaces work

**Timeline:** 2 weeks (Weeks 10-11)

---

### Phase 6: Polish & Testing (Weeks 11-12)

**Objectives:** Performance, accessibility, cross-platform testing, packaging.

**Tasks:**
1. Performance optimization (virtual scrolling, lazy loading)
2. Accessibility audit (axe DevTools)
3. Cross-platform testing (Windows, macOS, Linux)
4. Error handling & logging
5. Packaging & code signing
6. Documentation (user + developer)

**Acceptance Criteria:**
- ✅ Loads <2s
- ✅ 1000+ blocks render without lag
- ✅ Passes axe audit (0 critical)
- ✅ Keyboard navigation works
- ✅ Installers built for all platforms

**Timeline:** 1 week (Week 12)

---

## Success Metrics

### Phase 0 Complete

- ✅ `wails dev` starts successfully
- ✅ Database created at ~/.fuknotion/fuknotion.db
- ✅ Can create/read/update/delete notes
- ✅ TailwindCSS applies styles
- ✅ HMR works

### MVP Complete (Phase 6)

**Functional:**
- User can create, edit, delete notes offline
- Notes sync to Google Drive
- Supports 1,000+ notes without lag
- Conflicts resolved without data loss

**Performance:**
- App launch: <2s
- Note open: <100ms
- Auto-save: <50ms
- Full sync (1000 notes): <30s

**Quality:**
- 0 critical bugs
- 0 critical accessibility issues
- <5% sync error rate
- Builds on Windows/macOS/Linux

---

## Risk Assessment

### High Priority Risks

**Risk 1: BlockNote performance with large documents**
- Mitigation: Implement virtual scrolling in Phase 6
- Contingency: Limit document size, show warning

**Risk 2: Google Drive API rate limits**
- Mitigation: Batch operations, exponential backoff
- Contingency: Show sync paused message, retry later

**Risk 3: Sync conflicts cause data loss**
- Mitigation: Always backup before merge, show conflict UI
- Contingency: User manually resolves, restore from backup

**Risk 4: Cross-platform build issues**
- Mitigation: Use CGO-free dependencies, test early
- Contingency: Drop Linux support if critical issues

### Medium Priority Risks

**Risk 5: OAuth callback fails in desktop context**
- Mitigation: Use localhost:8080 callback, test thoroughly
- Contingency: Manual token paste as fallback

**Risk 6: Wails HMR not working**
- Mitigation: Follow official Vite config, test early
- Contingency: Restart dev server manually

---

## Unresolved Questions

1. **Real-time collaboration:** Required for MVP? Impacts CRDT complexity.
2. **End-to-end encryption:** Required for cloud sync? Impacts search performance.
3. **Mobile apps:** iOS/Android planned? Wails is desktop-only (separate React Native app).
4. **Plugin system:** Custom block types by users? Requires plugin architecture.
5. **Version history:** Notion-like snapshots? Needs storage strategy.
6. **Export formats:** PDF, HTML, Obsidian? Which priority?
7. **Monetization:** Free/open-source or commercial? Impacts license.
8. **AI integration:** Summarization, generation? Which LLM provider?
9. **Data residency:** GDPR compliance? Impacts logging, encryption.
10. **License:** MIT, GPL, proprietary? Impacts dependencies.

---

## Appendices

### A. User Personas

**Persona 1: Developer (Primary)**
- Uses Notion at work, wants offline control
- Needs code blocks, markdown export
- Power user (keyboard shortcuts)
- Values: Privacy, performance, extensibility

**Persona 2: Writer (Secondary)**
- Uses Google Docs, wants better formatting
- Needs distraction-free writing
- Keyboard shortcuts for formatting
- Values: Simplicity, reliability, backup

**Persona 3: Knowledge Worker (Secondary)**
- Uses Evernote, wants better organization
- Needs nested folders, search
- Occasional user (mouse-driven)
- Values: Familiarity, ease of use

### B. Competitive Analysis

**Notion:**
- Strengths: Rich blocks, databases, templates
- Weaknesses: Cloud-only, slow offline, privacy concerns
- Differentiation: Local-first, native performance

**Obsidian:**
- Strengths: Offline-first, plugin ecosystem, graph view
- Weaknesses: Plain markdown only, no WYSIWYG
- Differentiation: WYSIWYG editing, simpler UX

**OneNote:**
- Strengths: Handwriting, Office integration
- Weaknesses: Proprietary format, poor markdown
- Differentiation: Markdown support, cross-platform

**Bear:**
- Strengths: Beautiful UI, fast, tags
- Weaknesses: macOS/iOS only, no collaboration
- Differentiation: Cross-platform, multi-workspace

### C. Design Philosophy

**YAGNI (You Aren't Gonna Need It):**
- Build MVP features only, defer advanced features
- Example: No databases/boards until users request

**KISS (Keep It Simple, Stupid):**
- Prioritize simplicity over completeness
- Example: File-level sync (not CRDT) for MVP

**DRY (Don't Repeat Yourself):**
- Reusable components, shared utilities
- Example: Single editor component for all notes

**Offline-First:**
- Local database as source of truth
- All operations work without internet
- Sync is secondary concern

---

**Document Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Phase 0 Complete
**Next Milestone:** Phase 1 (Core UI Infrastructure)
