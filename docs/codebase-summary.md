# Codebase Summary

**Last Updated:** 2025-11-05
**Phase:** 01 - Project Setup & Scaffolding (Complete)
**Version:** 0.1.0

## Overview

Fuknotion is an offline-first desktop note-taking app built with Wails v2, combining React frontend with Go backend. Phase 01 delivers basic scaffolding with minimal working example (Greet function).

## Tech Stack

### Core Framework
- **Wails:** v2.10.2 (desktop framework)
- **Go:** 1.22.0 (backend runtime)
- **Node:** 18+ (frontend tooling)

### Frontend
- **React:** 18.2.0
- **TypeScript:** 5.3.3 (strict mode enabled)
- **Vite:** 5.0.8 (dev server + bundler)
- **Tailwind CSS:** 3.4.0
- **BlockNote:** 0.12.0 (future block editor)
- **Zustand:** 4.5.0 (future state management)

### Backend
- **Wails v2:** Application framework
- **Context:** Standard library for lifecycle management

### Build Tools
- **TypeScript Compiler:** Type checking + transpilation
- **PostCSS:** CSS processing with Autoprefixer
- **Vite:** HMR during development, production bundler

## Project Structure

```
/mnt/d/www/fuknotion/
├── backend/
│   ├── cmd/
│   │   └── fuknotion/
│   │       └── main.go              # Application entry point
│   ├── internal/
│   │   └── app/
│   │       └── app.go               # App struct with Greet method
│   └── pkg/                         # (Planned) Public libraries
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Root component with Greet demo
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Tailwind directives + global styles
│   ├── wailsjs/                     # Auto-generated Go bindings (gitignored)
│   ├── package.json                 # Dependencies, scripts
│   ├── tsconfig.json                # TypeScript config (strict mode)
│   ├── vite.config.ts               # Vite bundler config
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── postcss.config.js            # PostCSS plugins
│
├── build/                           # Build output directory (gitignored)
├── docs/                            # Documentation
├── plans/                           # Implementation plans
├── wails.json                       # Wails project config
├── go.mod                           # Go module definition
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── CLAUDE.md                        # AI assistant guidance
└── README.md                        # Project documentation
```

## Key Files

### Backend

#### `/mnt/d/www/fuknotion/backend/cmd/fuknotion/main.go`
- Application entry point
- Initializes Wails runtime with window config (1200x800)
- Binds `app.App` struct to frontend
- Registers lifecycle hooks (Startup, Shutdown)
- Embeds frontend assets (handled by Wails during build)

#### `/mnt/d/www/fuknotion/backend/internal/app/app.go`
- App struct with context field
- Lifecycle methods: `Startup()`, `Shutdown()`
- `Greet(name string) string` - demo method for testing bindings
- All exported methods auto-exposed to frontend via Wails

### Frontend

#### `/mnt/d/www/fuknotion/frontend/src/App.tsx`
- Demo UI with input field and button
- Calls Go `Greet()` via auto-generated binding
- Demonstrates React → Go communication pattern
- Uses Tailwind for styling

#### `/mnt/d/www/fuknotion/frontend/src/main.tsx`
- React 18 entry point with `createRoot()`
- Wraps App in `React.StrictMode`
- Renders to `#root` div

#### `/mnt/d/www/fuknotion/frontend/tsconfig.json`
- TypeScript strict mode enabled
- ES2020 target
- Bundler module resolution
- Path alias `@/*` → `src/*`
- Linting flags: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch

#### `/mnt/d/www/fuknotion/frontend/vite.config.ts`
- Dev server on port 34115
- Path alias `@` → `./src`
- React plugin enabled
- No manual chunk splitting (defaults)

#### `/mnt/d/www/fuknotion/wails.json`
- Project metadata (name, version, author)
- Frontend commands: install, build, dev watcher
- Directories: `./frontend` (frontend), `./backend/cmd/fuknotion` (main)
- Output filename: `fuknotion`

### Configuration

#### `/mnt/d/www/fuknotion/go.mod`
- Module: `fuknotion`
- Go version: 1.22.0
- Main dependency: `github.com/wailsapp/wails/v2 v2.10.2`
- 20+ transitive dependencies (Echo, WebSocket, GTK bindings, etc.)

#### `/mnt/d/www/fuknotion/.env.example`
- Google OAuth credentials (for future Google Drive sync)
- GitHub OAuth credentials (for future auth)
- App settings: environment, port, DB path
- Log level configuration

#### `/mnt/d/www/fuknotion/.gitignore`
- Wails artifacts: `build/bin`, `frontend/dist`, `frontend/wailsjs`
- Dependencies: `node_modules`, `vendor/`
- Environment files (except `.env.example`)
- IDE/OS files
- Project-specific: `repomix-output.xml`, `logs.txt`

## Architecture Decisions

### Why Wails v2 (Not v3)
- v2.10.2 stable, production-ready
- v3 in alpha/beta at project start
- Decision documented in implementation plan

### Standard Go Project Layout
- `cmd/` for executables
- `internal/` for private code (not importable by other projects)
- `pkg/` planned for public libraries
- Follows Go community conventions

### Minimal Bindings
- Only `app.App` struct bound to frontend
- Single `Greet()` method for validation
- Future services will add more bindings (auth, database, sync)

### TypeScript Strict Mode
- All strict checks enabled
- Unused variable detection
- Type safety enforced at compile time
- Prevents runtime errors

### Tailwind Utility-First
- No custom CSS frameworks
- Rapid prototyping
- Consistent design system
- PostCSS integration for optimization

## Data Flow (Current)

1. User types name in input field (React state)
2. User clicks "Greet" button
3. Frontend calls `Greet(name)` via `wailsjs/go/app/App`
4. Wails IPC bridge sends message to Go runtime
5. Go `app.App.Greet()` executes, returns string
6. Wails sends result back to frontend
7. React updates greeting state, displays result

## Planned Structure (Future Phases)

```
backend/internal/
├── app/          # App struct (current)
├── auth/         # OAuth 2.0, session management
├── database/     # SQLite with CR-SQLite
├── sync/         # Google Drive REST API
└── models/       # Data structures (User, Workspace, Note)

frontend/src/
├── components/   # UI components (Editor, Sidebar, Toolbar)
├── hooks/        # Custom React hooks
├── services/     # API service layer
├── stores/       # Zustand state stores
├── types/        # TypeScript interfaces
└── utils/        # Helper functions
```

## Build Artifacts

### Development (`wails dev`)
- Go backend runs directly (no compilation needed)
- Vite dev server on port 34115
- Hot reload for both frontend and backend
- TypeScript bindings auto-generated to `frontend/wailsjs/`

### Production (`wails build`)
- Frontend bundled to `frontend/dist/`
- Go backend compiled with embedded assets
- Single executable in `build/bin/fuknotion` (or `.exe` on Windows)
- Platform-specific (Linux, macOS, Windows)

## Environment

### Local Storage (Planned)
```
~/.fuknotion/
├── user.db                    # User profile, workspaces list, auth tokens
└── workspaces/
    ├── ws-{id}.db             # Workspace metadata (CRDT for sync)
    └── notes/
        └── {note-id}.md       # Note content (YAML frontmatter)
```

### Development Ports
- Vite dev server: 34115
- Wails runtime: embedded (no separate port)

## Dependencies

### Go Dependencies (19 files checked)
- Core: `wails/v2 v2.10.2`
- Web: `labstack/echo/v4`, `gorilla/websocket`
- Platform: `go-ole` (Windows), `godbus/dbus` (Linux)
- Utilities: `google/uuid`, `pkg/browser`, `pkg/errors`

### Frontend Dependencies (18 packages)
- **React ecosystem:** react, react-dom, @types/react
- **Editor:** @blocknote/core, @blocknote/react (not used yet)
- **State:** zustand (not used yet)
- **Styling:** tailwindcss, postcss, autoprefixer
- **Build:** vite, typescript, @vitejs/plugin-react

## Known Issues

None. Phase 01 complete, all validation tests passed.

## Next Steps (Phase 02)

1. Database layer (SQLite)
2. User profile management
3. Workspace CRUD operations
4. Basic data models (User, Workspace, Note)
5. File system operations for local storage

## Metrics

- **Total Go files:** 2
- **Total TypeScript/TSX files:** 4 (excluding node_modules)
- **Total lines of code:** ~400 (excluding dependencies)
- **Build time:** ~5-10 seconds
- **Bundle size:** Not measured (dev phase)
