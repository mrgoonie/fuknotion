# Fuknotion Project Roadmap

**Project:** Fuknotion - Notion-like Desktop Note-Taking App
**Framework:** Wails v2 (React + Go)
**Status:** Active Development
**Last Updated:** 2025-11-05

## Executive Summary

Fuknotion is offline-first desktop note app with Notion-like editor, Google Drive sync, multi-workspace support. Built with Wails (React frontend, Go backend), BlockNote editor, CR-SQLite for conflict-free sync.

**Overall Progress:** 17.6% (3/17 phases complete: 01, 04, 05)

## Tech Stack

- **Frontend:** React 18, TypeScript, BlockNote editor, Tailwind CSS, Zustand
- **Backend:** Go 1.22+, SQLite with CR-SQLite extension
- **Desktop:** Wails v2
- **Sync:** Google Drive REST API
- **Auth:** OAuth 2.0 (Google, GitHub, Email)

## Timeline Overview

**Total Duration:** ~43 days (~2 months)
**Start Date:** 2025-11-05
**Estimated Completion:** 2025-01-17 (mid-January 2026)

## Phase Status

### Phase 01: Project Setup & Scaffolding ✅ COMPLETE
**Duration:** 2 days
**Status:** Complete
**Progress:** 100%

**Deliverables:**
- ✅ Wails project initialized with React + TypeScript
- ✅ Go backend structure (backend/cmd/fuknotion/main.go)
- ✅ Frontend configured (Vite, Tailwind CSS, TypeScript strict mode)
- ✅ Basic app with Greet function (Go ↔ React communication verified)
- ✅ Development and production builds functional
- ✅ Git repository initialized
- ✅ Documentation (README.md, .env.example)

**Key Files Created:**
- wails.json, go.mod
- backend/cmd/fuknotion/main.go
- backend/internal/app/app.go
- frontend/package.json, tsconfig.json, vite.config.ts
- frontend/src/App.tsx, main.tsx, index.css
- frontend/tailwind.config.js, postcss.config.js
- frontend/wailsjs/go/app/App.js (minimal bindings)

**Critical Issue Resolved:**
- main.go initially placed at project root causing Go internal package import failures
- Moved to backend/cmd/fuknotion/main.go following Go best practices
- All compilation errors resolved

**Success Metrics:**
- Go compilation: ✅ Working
- Frontend build: ✅ Working
- TypeScript strict mode: ✅ Enabled
- Tailwind CSS: ✅ Functional
- Go-React bridge: ✅ Verified

### Phase 02: Core Architecture
**Duration:** 3 days
**Status:** Not Started
**Progress:** 0%
**Dependencies:** Phase 01 ✅

**Planned Deliverables:**
- State management setup (Zustand)
- Routing structure
- File system layer
- Error boundary implementation
- Logger service
- Configuration management

**Next Steps:**
1. Design state management architecture
2. Implement Zustand stores for app state
3. Create routing structure for navigation
4. Build file system abstraction layer
5. Add error handling and logging

### Phase 03: Authentication & User Management
**Duration:** 3 days
**Status:** Not Started
**Progress:** 0%
**Dependencies:** Phase 02

**Planned Features:**
- OAuth 2.0 implementation (Google, GitHub, Email)
- Token storage in OS keychain
- User profile management
- Session handling

### Phase 04: SQLite Database ✅ COMPLETE
**Duration:** 2 days
**Status:** Complete
**Progress:** 100%
**Dependencies:** Phase 02 (skipped, implemented directly after Phase 01)

**Deliverables:**
- ✅ Database wrapper (database/database.go)
- ✅ InitUserDB with user profile and workspaces tables
- ✅ InitWorkspaceDB with notes, folders, members tables
- ✅ Foreign keys enabled globally
- ✅ Performance indexes created
- ✅ Members table with role constraints (owner, editor, viewer)
- ✅ 15 tests created (database_test.go)
- ✅ Test coverage: 67.7%

**Key Files Created:**
- backend/internal/database/database.go
- backend/internal/database/database_test.go
- backend/internal/database/schema.sql

**Success Metrics:**
- Database initialization: ✅ Working
- Foreign keys: ✅ Enabled
- Indexes: ✅ Created
- Constraints: ✅ Enforced
- Tests: ✅ All passing (15/15)

### Phase 05: Markdown Storage ✅ COMPLETE
**Duration:** 2 days
**Status:** Complete
**Progress:** 100%
**Dependencies:** Phase 04 ✅

**Deliverables:**
- ✅ YAML frontmatter parser (note/parser.go)
- ✅ Frontmatter serializer
- ✅ Note service with full CRUD (note/service.go)
- ✅ FileSystem service with path validation (filesystem/service.go)
- ✅ Files stored as {id}.md with frontmatter
- ✅ NULL handling for optional folder_id
- ✅ Integration with database layer
- ✅ 12 tests created (parser, service)
- ✅ Test coverage: 69.7% (service), ~85% (parser)

**Key Files Created:**
- backend/internal/filesystem/service.go
- backend/internal/note/parser.go
- backend/internal/note/parser_test.go
- backend/internal/note/service.go
- backend/internal/note/service_test.go
- backend/internal/models/note.go

**Success Metrics:**
- Frontmatter parsing: ✅ Working
- Note CRUD: ✅ All operations functional
- File storage: ✅ UUID-based filenames
- Path validation: ✅ Security checks passing
- Tests: ✅ All passing (12/12)

**Code Review:**
- Status: ✅ APPROVED
- Critical issues: 0
- High issues: 0
- Medium issues: 0

### Phase 06-17: Remaining Phases
**Status:** Pending
**Progress:** 0%

See `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/plan.md` for detailed phase breakdown.

## Architecture Highlights

**Local Storage Structure:**
```
~/.fuknotion/
├── user.db                    # User profile, workspaces list, auth
└── workspaces/
    ├── ws-{id}.db             # Workspace metadata (CRDT)
    └── notes/
        └── {note-id}.md       # Note content (YAML frontmatter)
```

**Key Technical Decisions:**
1. **BlockNote** for editor (Notion-like features out of box)
2. **CR-SQLite** for metadata sync (automatic conflict resolution)
3. **Markdown + YAML frontmatter** for notes (portable, readable)
4. **DB-per-workspace** pattern (isolation, security)
5. **OAuth PKCE** for auth (required, secure)
6. **Drive folder sharing** for collaboration (serverless)

## Success Criteria

**Phase 01 Success Criteria:** ✅ ALL MET
- [x] Wails app initializes without errors
- [x] `wails dev` launches app with hot reload
- [x] `wails build` produces executable
- [x] Go → React communication works
- [x] TypeScript strict mode enabled
- [x] Tailwind CSS working
- [x] Project structure follows conventions
- [x] Git repository initialized
- [x] README documents setup steps

**Overall Project Success Criteria:**
- [ ] App works 100% offline (all CRUD operations)
- [ ] Sync works with multiple devices (no data loss)
- [ ] Notion-like editor UX (blocks, slash commands, drag-drop)
- [ ] Multi-workspace support with collaboration
- [ ] Cross-platform (Windows, macOS, Linux)
- [ ] App size < 20MB (significantly smaller than Electron)

## Risk Assessment

### Resolved Risks
✅ **Go compilation errors** - RESOLVED: Corrected main.go location to backend/cmd/fuknotion/

### Active Risks
⚠️ **Wails version compatibility** - Mitigation: Use stable v2, monitor updates
⚠️ **Platform-specific build issues** - Mitigation: Test early on all platforms
⚠️ **TypeScript binding generation failures** - Mitigation: Follow Go naming conventions

### Future Risks
🔴 **SQLite sync conflicts** - Planned mitigation: CR-SQLite extension with CRDT
🔴 **Multi-tenant offline mode** - Planned mitigation: DB-per-workspace pattern
🔴 **Markdown merge conflicts** - Planned mitigation: Three-way merge with conflict UI
🔴 **Wails cookie limitation** - Planned mitigation: OAuth in system browser, tokens in keychain

## Milestones

### Milestone 1: Foundation Complete ✅
**Date:** 2025-11-05
**Status:** Achieved
- Phase 01 complete
- Development environment functional
- Basic Go-React communication verified

### Milestone 2: Data Layer Complete ✅
**Date:** 2025-11-05
**Status:** Achieved
- Phase 04 complete (SQLite Database)
- Phase 05 complete (Markdown Storage)
- Database schema implemented
- Note CRUD operations functional
- File storage with path validation

### Milestone 3: Core Architecture Complete
**Target:** 2025-11-08
**Status:** Pending
- Phase 02 complete
- State management operational
- Routing functional

### Milestone 4: MVP Feature Complete
**Target:** 2025-11-22
**Status:** Pending
- Phases 03-09 complete
- Authentication working
- Basic editor functional
- Local storage operational

### Milestone 4: Sync & Collaboration
**Target:** 2025-12-05
**Status:** Pending
- Phases 10-13 complete
- Google Drive sync working
- Sharing functional

### Milestone 5: Production Ready
**Target:** 2026-01-17
**Status:** Pending
- All 17 phases complete
- Testing complete
- Distribution packages built

## Changelog

### 2025-11-05 - Phases 04-05 Complete

**Added:**
- SQLite database layer with two-database pattern
- Database wrapper with connection management
- InitUserDB and InitWorkspaceDB functions
- Foreign keys, indexes, constraints
- FileSystem service with path validation
- YAML frontmatter parser and serializer
- Note service with full CRUD operations
- Models for Note, Workspace, Folder entities
- Comprehensive test suite (27 tests)
- Code review completed and approved

**Technical Details:**
- Database: SQLite with foreign keys enabled globally
- Storage: Markdown files with YAML frontmatter
- File naming: UUID-based ({id}.md)
- Security: Parameterized queries, path validation
- Testing: 67.7% database coverage, 69.7% note service coverage
- NULL handling for optional folder_id

**Database Schema:**
- user.db: user, workspaces tables
- workspace.db: notes, folders, members tables
- Performance indexes on foreign keys and common queries
- Role constraints in members table (owner, editor, viewer)

**File Storage:**
- Storage path: ~/.fuknotion/workspaces/{ws}/notes/{id}.md
- YAML frontmatter with metadata
- File permissions: 0600 (files), 0700 (directories)
- Directory traversal prevention

### 2025-11-05 - Phase 01 Complete

**Added:**
- Wails project initialization with React + TypeScript
- Go backend structure with proper directory layout
- Frontend build system (Vite, Tailwind CSS)
- Basic app with Greet function demonstrating Go-React communication
- Development and production build configuration
- Project documentation (README.md, .env.example)

**Fixed:**
- Critical: main.go location moved from project root to backend/cmd/fuknotion/
- Go internal package import errors resolved
- TypeScript strict mode compilation issues

**Technical Details:**
- Wails v2 with React-TS template
- Go 1.22+ with standard project layout
- TypeScript strict mode enabled
- Tailwind CSS v3.4.0 configured
- Hot reload functional in dev mode

## Next Actions

**Immediate (This Week):**
1. Begin Phase 02: Core Architecture
2. Design Zustand state management structure
3. Implement routing framework
4. Create file system abstraction layer

**Short Term (Next 2 Weeks):**
1. Complete Phase 02 (Core Architecture)
2. Begin Phase 03 (Authentication)
3. Implement OAuth 2.0 flow
4. Setup OS keychain integration

**Medium Term (Next Month):**
1. Complete Phases 03-06
2. Implement SQLite database layer
3. Build Markdown file storage
4. Integrate BlockNote editor

## Resources

**Documentation:**
- Implementation Plan: `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/plan.md`
- Phase 01 Details: `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/phase-01-project-setup.md`
- README: `/mnt/d/www/fuknotion/README.md`

**Research Reports:**
- Wails best practices
- Block-based editors comparison
- Google Drive sync strategies
- SQLite CRDT patterns
- Desktop authentication
- Multi-tenant architecture
- Markdown storage with frontmatter

Location: `/mnt/d/www/fuknotion/plans/reports/`

## Team & Responsibilities

**Current Sprint:** Phase 02 - Core Architecture
**Sprint Duration:** 3 days
**Sprint Goal:** Establish foundational architecture for state management, routing, file system

## Notes

- Phase 01 completed successfully (2025-11-05)
- Phases 04-05 completed successfully (2025-11-05)
- **Note:** Phase 02-03 skipped, implemented Phases 04-05 first
- Database layer fully functional with 67.7% test coverage
- Note storage with markdown + YAML frontmatter operational
- File system security validated (path traversal prevention)
- Code review approved with no critical/high issues
- All 27 tests passing (database, parser, service)
- Ready to proceed with Phase 02 (Core Architecture) or Phase 06 (Workspace Management)
- No blocking issues

---

**Report Generated:** 2025-11-05
**Next Review:** 2025-11-08 (After next phase completion)
