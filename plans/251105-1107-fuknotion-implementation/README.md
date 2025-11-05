# Fuknotion Implementation Plan - Summary

**Date:** 2025-11-05
**Project:** Fuknotion - Notion-like Desktop Note-Taking App
**Status:** Research & Planning Complete

## Overview

Complete research and implementation plan for Fuknotion desktop app built with Wails (React + Go), featuring offline-first architecture, Google Drive sync, and Notion-like block editor.

## Research Reports (7 completed)

All research reports located in `/mnt/d/www/fuknotion/plans/reports/`:

1. **Wails Best Practices** (`251105-researcher-wails-to-planner.md`)
   - 90% smaller than Electron, native webview
   - TypeScript bindings auto-generated
   - OAuth in system browser (webview cookies unreliable)

2. **Block-Based Editors** (`251105-researcher-editors-to-planner.md`)
   - Recommendation: **BlockNote** (Notion-style out-of-box)
   - Built on ProseMirror + TipTap
   - 2-3 months dev time saved vs building custom

3. **Google Drive Sync** (`251105-researcher-gdrive-to-planner.md`)
   - Drive REST API v3 (Android API deprecated 2025)
   - Three-way merge for markdown files
   - OAuth mandatory for Drive access (March 2025+)

4. **SQLite CRDT Sync** (`251105-researcher-sqlite-to-planner.md`)
   - Solution: **CR-SQLite** extension
   - Automatic conflict resolution via CRDT
   - Sync operation logs, not full database

5. **Authentication** (`251105-researcher-auth-to-planner.md`)
   - OAuth 2.0 with PKCE for Google/GitHub
   - Tokens in OS keychain (never plain text)
   - System browser flow for desktop apps

6. **Multi-Tenant Architecture** (`251105-researcher-multitenant-to-planner.md`)
   - DB-per-workspace pattern (isolation + security)
   - User.db stores workspace list + profile
   - Drive folder sharing for collaboration

7. **Markdown Storage** (`251105-researcher-markdown-to-planner.md`)
   - YAML frontmatter for metadata (standard format)
   - Flat file structure (simpler sync)
   - Compatible with Obsidian, Zettlr

## Implementation Plan

**Location:** `/mnt/d/www/fuknotion/plans/251105-1107-fuknotion-implementation/`

### Main Plan

**File:** `plan.md`
- Overview of entire project
- 17 phases, ~43 days (~2 months)
- Tech stack decisions
- Progress tracking

### Phase Files (17 total)

All phases documented with:
- Context links (parent, dependencies, research)
- Overview (date, description, priority, status)
- Key insights
- Requirements (functional + non-functional)
- Architecture (code examples)
- Related files
- Implementation steps
- Todo list
- Success criteria
- Risk assessment
- Security considerations
- Next steps

**Critical Phases:**
- **Phase 01:** Project Setup (2 days) - Wails initialization
- **Phase 02:** Core Architecture (3 days) - State, routing, file system
- **Phase 03:** Authentication (3 days) - OAuth, keychain
- **Phase 04:** SQLite Database (2 days) - CR-SQLite, CRDT
- **Phase 05:** Markdown Storage (2 days) - YAML frontmatter
- **Phase 06:** Text Editor (5 days) - BlockNote integration ⭐
- **Phase 12:** Google Drive Sync (5 days) - CRDT + three-way merge ⭐

**Other Phases:**
- Phase 07: Left Sidebar (3 days)
- Phase 08: Right Sidebar (2 days)
- Phase 09: Tabs (2 days)
- Phase 10: Search (3 days)
- Phase 11: Themes (1 day)
- Phase 13: Sharing (2 days)
- Phase 14: Trash (1 day)
- Phase 15: Onboarding (2 days)
- Phase 16: Testing (3 days)
- Phase 17: Distribution (2 days)

## Key Technical Decisions

### Architecture

**Frontend:**
- React 18 + TypeScript
- BlockNote editor (Notion-like)
- Zustand for state (lightweight)
- Tailwind CSS for styling

**Backend:**
- Go 1.22+
- SQLite with CR-SQLite extension
- Native file I/O (cross-platform)

**Desktop:**
- Wails v3 (React + Go)
- ~10MB app size (vs ~100MB Electron)
- Native webview (system integration)

**Storage:**
```
~/.fuknotion/
├── user.db                    # Profile, workspaces, auth
└── workspaces/
    ├── ws-{id}.db             # Workspace metadata (CRDT)
    └── notes/
        └── {note-id}.md       # Note content (YAML frontmatter)
```

**Sync Strategy:**
- SQLite: CR-SQLite CRDT (automatic merge)
- Markdown: Three-way merge (base, local, remote)
- Google Drive: Storage backend
- Offline-first: Queue operations when disconnected

### Challenge Solutions

**Challenge 1: SQLite sync conflicts across devices**
**Solution:** CR-SQLite extension with CRDT-based automatic conflict resolution. Sync operation logs instead of full database.

**Challenge 2: Multi-tenant (workspaces) without breaking offline mode**
**Solution:** DB-per-workspace pattern. Each workspace = separate .db file. User.db stores membership. Drive folder sharing for collaboration. All data local when user has access.

**Challenge 3: Markdown file merge conflicts**
**Solution:** Three-way merge (base, local, remote) with conflict UI for manual resolution when auto-merge fails. Text-based format merges cleanly.

**Challenge 4: Wails webview cookie limitation**
**Solution:** OAuth in system browser (not webview). Redirect to localhost callback. Store tokens in OS keychain.

## File Structure

```
/mnt/d/www/fuknotion/plans/
├── reports/                                    # Research reports
│   ├── 251105-researcher-wails-to-planner.md
│   ├── 251105-researcher-editors-to-planner.md
│   ├── 251105-researcher-gdrive-to-planner.md
│   ├── 251105-researcher-sqlite-to-planner.md
│   ├── 251105-researcher-auth-to-planner.md
│   ├── 251105-researcher-multitenant-to-planner.md
│   └── 251105-researcher-markdown-to-planner.md
│
└── 251105-1107-fuknotion-implementation/      # Implementation plan
    ├── README.md (this file)
    ├── plan.md                                # Main overview
    ├── phase-01-project-setup.md
    ├── phase-02-core-architecture.md
    ├── phase-03-authentication.md
    ├── phase-04-sqlite-database.md
    ├── phase-05-markdown-storage.md
    ├── phase-06-text-editor.md
    ├── phase-07-left-sidebar.md
    ├── phase-08-right-sidebar.md
    ├── phase-09-tabs.md
    ├── phase-10-search.md
    ├── phase-11-themes.md
    ├── phase-12-gdrive-sync.md
    ├── phase-13-sharing.md
    ├── phase-14-trash.md
    ├── phase-15-onboarding.md
    ├── phase-16-testing.md
    └── phase-17-distribution.md
```

## Success Metrics

- [ ] App works 100% offline (all CRUD operations)
- [ ] Sync works across devices (no data loss)
- [ ] Notion-like editor UX (blocks, slash commands, drag-drop)
- [ ] Multi-workspace with collaboration
- [ ] Cross-platform (Windows, macOS, Linux)
- [ ] App size < 20MB

## Timeline

- **Total Duration:** ~43 days (~2 months)
- **Critical Path:** Phases 01-06, 12 (setup → editor → sync)
- **Parallelizable:** UI phases (07-11, 13-15) after Phase 06

## Next Steps

1. **Review this plan** - Approve or request changes
2. **Begin Phase 01** - Project setup & scaffolding
3. **Setup repository** - Git, CI/CD
4. **Start development** - Follow phase-by-phase implementation

## Unresolved Questions

### From Research

**Wails:** None - well-documented and proven.

**BlockNote:**
- Exact bundle size impact on Wails app?
- Customization limits for internal links?
- Performance with 10,000+ block notes offline?

**Google Drive Sync:**
- drive.file vs drive.appdata scope?
- Sync frequency: 5 min vs event-driven?
- Where to store base version (Drive or local)?
- Handle Drive quota exceeded?

**SQLite CRDT:**
- Auto-compact change logs or user action?
- Max workspace db size before degradation?
- Member list sync without server?

**Auth:**
- Use Auth0/Supabase or direct OAuth?
- Support multiple Google accounts simultaneously?
- Handle refresh_token revocation?

**Multi-Tenant:**
- Workspace discovery: automatic or user action?
- Handle name conflicts (two "Work" workspaces)?
- Limit on workspaces per user?

**Markdown:**
- Support both .md and .json storage?
- BlockNote custom blocks in markdown?
- Note file size limit?

### Recommendations

Start with simplest approach for MVP (Phase 01-06), add complexity in later phases. Document decisions as they're made. Revisit unresolved questions during implementation with real-world data.

## Contact

For questions about this plan, refer to:
- Research reports in `/plans/reports/`
- Phase files in `/plans/251105-1107-fuknotion-implementation/`
- CLAUDE.md for development rules
