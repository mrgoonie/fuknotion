# Fuknotion Implementation Plan

**Project:** Fuknotion - Notion-like Desktop Note-Taking App
**Framework:** Wails (React + Go)
**Plan Date:** 2025-11-05 to 2025-11-07
**Status:** Planning Complete

## Overview

Fuknotion is offline-first desktop note app with Notion-like editor, Google Drive sync, multi-workspace support. Built with Wails (React frontend, Go backend), BlockNote editor, CR-SQLite for conflict-free sync.

## Tech Stack

- **Frontend:** React 18, TypeScript, BlockNote editor, Tailwind CSS
- **Backend:** Go 1.22+, SQLite with CR-SQLite extension
- **Desktop:** Wails v3
- **Sync:** Google Drive REST API
- **Auth:** OAuth 2.0 (Google, GitHub, Email)

## Architecture

**Local Storage:**
```
~/.fuknotion/
├── user.db                    # User profile, workspaces list, auth
└── workspaces/
    ├── ws-{id}.db             # Workspace metadata (CRDT)
    └── notes/
        └── {note-id}.md       # Note content (YAML frontmatter)
```

**Sync Strategy:**
- SQLite metadata via CR-SQLite (CRDT, conflict-free)
- Markdown files via three-way merge
- Google Drive as storage backend
- Offline-first (queue operations when disconnected)

## Key Technical Decisions

1. **BlockNote** for editor (Notion-like features out of box)
2. **CR-SQLite** for metadata sync (automatic conflict resolution)
3. **Markdown + YAML frontmatter** for notes (portable, readable)
4. **DB-per-workspace** pattern (isolation, security)
5. **OAuth PKCE** for auth (required, secure)
6. **Drive folder sharing** for collaboration (serverless)

## Implementation Phases

**Phase 01:** Project Setup & Scaffolding (2 days) ✅
**Phase 02:** Core Architecture (3 days) ✅
**Phase 03:** Authentication & User Management (3 days) [DEFERRED]
**Phase 04:** Local SQLite Database (2 days) ✅ REVIEWED
**Phase 05:** Markdown File Storage (2 days) ✅ REVIEWED
**Phase 06:** Block-Based Text Editor (5 days) ✅ REVIEWED - FIXES REQUIRED
**Phase 07:** Left Sidebar Navigation (3 days)
**Phase 08:** Right Sidebar (2 days)
**Phase 09:** Tab Management (2 days)
**Phase 10:** Search Functionality (3 days)
**Phase 11:** Theme System (1 day)
**Phase 12:** Google Drive Sync (5 days)
**Phase 13:** Sharing System (2 days)
**Phase 14:** Trash & Deletion (1 day)
**Phase 15:** Onboarding Flow (2 days)
**Phase 16:** Testing & Optimization (3 days)
**Phase 17:** Packaging & Distribution (2 days)

**Total:** ~43 days (~2 months)

## Progress Tracking

- [x] Phase 01: Project setup ✅ COMPLETE
- [x] Phase 02: Core architecture ✅ COMPLETE
- [ ] Phase 03: Authentication (DEFERRED)
- [x] Phase 04: Local database ✅ COMPLETE + REVIEWED (251105)
- [x] Phase 05: Markdown storage ✅ COMPLETE + REVIEWED (251105)
- [x] Phase 06: Text editor ✅ COMPLETE + REVIEWED (251105) - All critical issues resolved
- [x] Phase 07: Left sidebar ✅ COMPLETE + REVIEWED (251105)
- [x] Phase 08: Right sidebar ✅ COMPLETE + REVIEWED (251105)
- [x] Phase 09: Tab Management ✅ COMPLETE (251105)
- [x] Phase 10: Search ✅ COMPLETE (251105)
- [ ] Phase 11: Themes (STARTING)
- [ ] Phase 12: Sync
- [ ] Phase 13: Sharing
- [ ] Phase 14: Trash
- [ ] Phase 15: Onboarding
- [ ] Phase 16: Testing
- [ ] Phase 17: Distribution

**Note:** Phase 03 (Authentication) deferred to later - focusing on core features first (YAGNI principle)

## Research Reports

All research completed. See `/plans/reports/`:
- Wails best practices
- Block-based editors comparison
- Google Drive sync strategies
- SQLite CRDT patterns
- Desktop authentication
- Multi-tenant architecture
- Markdown storage with frontmatter

## Challenges & Solutions

**Challenge 1: SQLite sync conflicts**
**Solution:** CR-SQLite extension with CRDT-based auto-merge

**Challenge 2: Multi-tenant offline mode**
**Solution:** DB-per-workspace, membership in user.db, Drive folder sharing

**Challenge 3: Markdown merge conflicts**
**Solution:** Three-way merge with conflict UI for manual resolution

**Challenge 4: Wails cookie limitation**
**Solution:** OAuth in system browser, tokens in OS keychain

## Success Criteria

- [ ] App works 100% offline (all CRUD operations)
- [ ] Sync works with multiple devices (no data loss)
- [ ] Notion-like editor UX (blocks, slash commands, drag-drop)
- [ ] Multi-workspace support with collaboration
- [ ] Cross-platform (Windows, macOS, Linux)
- [ ] App size < 20MB (significantly smaller than Electron)

## Next Steps

1. Review this plan and all phase documents
2. Approve or request changes
3. Begin Phase 01 implementation
4. Set up project repository and CI/CD

---

For detailed implementation steps, see individual phase files:
`phase-01-project-setup.md` through `phase-17-distribution.md`
