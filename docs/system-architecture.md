# System Architecture

**Last Updated:** 2025-11-05
**Phase:** 01 - Project Setup & Scaffolding (Complete)
**Version:** 0.1.0

## Overview

Fuknotion uses Wails v2 hybrid architecture: React frontend communicates with Go backend via IPC bridge. Frontend runs in WebView, backend runs as native process. All data stored locally with planned Google Drive sync.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Fuknotion Desktop App                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  WebView (Frontend)                   │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │   React     │  │  TypeScript  │  │  Tailwind  │  │   │
│  │  │ Components  │  │    Types     │  │    CSS     │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘  │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │        Auto-generated Wails Bindings         │    │   │
│  │  │      (frontend/wailsjs/go/app/App.js)        │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └───────────────────────────┬──────────────────────────┘   │
│                              │                              │
│                         Wails IPC Bridge                    │
│                     (Bidirectional RPC)                     │
│                              │                              │
│  ┌───────────────────────────┴──────────────────────────┐   │
│  │                   Go Runtime (Backend)                │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │  App Struct │  │   Context    │  │  Lifecycle │  │   │
│  │  │  (app.App)  │  │  Management  │  │   Hooks    │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘  │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │         Exported Methods                    │     │   │
│  │  │  - Greet(name string) string                │     │   │
│  │  │  - Startup(ctx context.Context)             │     │   │
│  │  │  - Shutdown(ctx context.Context)            │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Layer

#### React 18.2.0
- Component-based UI
- Functional components with hooks
- Strict mode enabled for development
- Future: Concurrent rendering features

#### TypeScript 5.3.3
- Strict type checking enabled
- ES2020 target
- Bundler module resolution
- Path aliases: `@/*` → `src/*`
- Compiler flags: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch

#### Tailwind CSS 3.4.0
- Utility-first styling
- No custom CSS framework
- PostCSS integration
- Autoprefixer for browser compatibility
- JIT mode enabled

#### Vite 5.0.8
- Development server with HMR
- Port: 34115
- Fast rebuild times (<100ms)
- ESM-based bundler
- React plugin for JSX/TSX support

#### Planned Frontend Libraries
- **BlockNote 0.12.0:** Notion-like block editor (installed, not used yet)
- **Zustand 4.5.0:** State management (installed, not used yet)

### Backend Layer

#### Go 1.22.0
- Native performance
- Goroutines for concurrency (future)
- Standard library for most operations
- Context-based lifecycle management

#### Wails v2.10.2
- Desktop framework bridging Go + WebView
- Auto-generates TypeScript bindings from Go structs
- IPC communication layer
- Cross-platform window management
- Asset embedding for production builds

#### Planned Backend Libraries
- **SQLite:** Embedded database (not integrated yet)
- **CR-SQLite:** CRDT extension for conflict-free replication (future)
- **Google Drive API:** REST client for sync (future)

### Build System

#### Wails CLI
- `wails dev` - Development mode with hot reload
- `wails build` - Production build with asset embedding
- `wails generate module` - TypeScript binding generation

#### Frontend Build Chain
1. TypeScript compiler (`tsc`) - Type checking
2. Vite - Bundling + minification
3. PostCSS - CSS processing
4. Output: `frontend/dist/`

#### Backend Build Chain
1. Go compiler - Native binary
2. Asset embedding - Frontend files embedded into binary
3. Platform-specific compilation (Linux/macOS/Windows)
4. Output: `build/bin/fuknotion`

## Project Structure

```
fuknotion/
├── backend/                       # Go backend code
│   ├── cmd/
│   │   └── fuknotion/
│   │       └── main.go           # Entry point, Wails initialization
│   ├── internal/                 # Private application code
│   │   └── app/
│   │       └── app.go            # App struct with exported methods
│   └── pkg/                      # Public libraries (planned)
│
├── frontend/                      # React frontend code
│   ├── src/
│   │   ├── App.tsx               # Root component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles + Tailwind
│   ├── wailsjs/                  # Auto-generated bindings (gitignored)
│   ├── package.json              # NPM dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── vite.config.ts            # Vite config
│   └── tailwind.config.js        # Tailwind config
│
├── build/                         # Build output (gitignored)
│   └── bin/
│       └── fuknotion             # Compiled executable
│
├── docs/                          # Documentation
├── plans/                         # Implementation plans
├── wails.json                     # Wails project config
├── go.mod                         # Go module definition
└── README.md                      # Project overview
```

## Data Flow

### Frontend → Backend Communication

```
┌──────────────┐
│ React Event  │  User clicks "Greet" button
│  (onClick)   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Wails Binding Call                      │
│  import { Greet } from '../wailsjs/...'  │
│  const result = await Greet(name)        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Wails IPC Bridge       │  Serializes call, sends to Go
│   (JSON-RPC over stdio)  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────┐
│   Go Method Execution        │
│   func (a *App) Greet(...)   │
│   return "Hello " + name     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Wails IPC Bridge       │  Serializes response
│   (Returns JSON)         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Promise Resolution     │  TypeScript receives typed result
│   setGreeting(result)    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│  React Re-render │  UI updates with new state
└──────────────────┘
```

### Backend → Frontend Communication (Planned)

Future phases will use Wails runtime events:
- `runtime.EventsEmit()` - Broadcast events from Go
- `runtime.EventsOn()` - Subscribe to events in React
- Use cases: Sync status updates, real-time notifications

## Current Implementation (Phase 01)

### Backend Components

#### `main.go`
- **Responsibility:** Application entry point
- **Key functions:**
  - Initialize `app.App` struct
  - Configure Wails runtime (window size, background color)
  - Bind `app.App` to frontend
  - Register lifecycle hooks
  - Embed frontend assets (via `embed.FS`)

#### `app.go`
- **Responsibility:** Core application logic
- **Struct fields:**
  - `ctx context.Context` - Wails runtime context
- **Methods:**
  - `NewApp() *App` - Constructor
  - `Startup(ctx context.Context)` - Called on app start
  - `Shutdown(ctx context.Context)` - Called on app exit
  - `Greet(name string) string` - Demo method

### Frontend Components

#### `main.tsx`
- **Responsibility:** React initialization
- **Key functions:**
  - Create React root
  - Render `<App />` component
  - Enable strict mode

#### `App.tsx`
- **Responsibility:** Demo UI for testing bindings
- **State:**
  - `name: string` - Input field value
  - `greeting: string` - Response from Go
- **Methods:**
  - `handleGreet()` - Calls Go `Greet()`, updates state

#### `index.css`
- **Responsibility:** Global styles
- **Content:**
  - Tailwind directives (@tailwind base/components/utilities)
  - CSS reset (box-sizing, margin, padding)
  - System font stack

## Configuration Files

### `wails.json`
- Project metadata (name, version, author)
- Build commands: `npm install`, `npm run build`
- Dev watcher: `npm run dev`
- Directory mappings:
  - `frontenddir: ./frontend`
  - `main: ./backend/cmd/fuknotion`
- Auto server URL detection for dev mode

### `go.mod`
- Module name: `fuknotion`
- Go version: 1.22.0
- Direct dependency: `wails/v2 v2.10.2`
- Transitive dependencies: Echo, WebSocket, platform bindings

### `tsconfig.json`
- Target: ES2020
- Module: ESNext (bundler resolution)
- Strict mode: enabled
- JSX: react-jsx (React 18 transform)
- Path alias: `@/*` → `src/*`
- Linting: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch

### `vite.config.ts`
- Plugins: React
- Dev server: port 34115
- Resolve alias: `@` → `./src`
- Build: default Rollup options (no manual chunks)

## Planned Architecture (Future Phases)

### Database Layer (Phase 02)
```
backend/internal/database/
├── sqlite.go         # SQLite connection management
├── migrations.go     # Schema migrations
└── queries.go        # SQL queries
```

### Authentication Layer (Phase 03)
```
backend/internal/auth/
├── oauth.go          # Google/GitHub OAuth
├── session.go        # Session management
└── tokens.go         # JWT/refresh tokens
```

### Sync Layer (Phase 04)
```
backend/internal/sync/
├── gdrive.go         # Google Drive API client
├── crdt.go           # CRDT merge logic
└── conflict.go       # Conflict resolution
```

### Frontend State Management (Phase 05+)
```
frontend/src/stores/
├── userStore.ts      # User profile state
├── workspaceStore.ts # Workspaces list
└── editorStore.ts    # Current note/editor
```

## Development Workflow

### Development Mode
1. Run `wails dev`
2. Wails starts Go backend
3. Vite dev server starts on port 34115
4. TypeScript bindings auto-generated to `frontend/wailsjs/`
5. Browser opens WebView with frontend
6. Hot reload enabled:
   - Go changes: auto-restart backend
   - React changes: HMR (no page reload)

### Production Build
1. Run `wails build`
2. TypeScript compiles to JavaScript
3. Vite bundles frontend to `frontend/dist/`
4. Go compiles backend with embedded assets
5. Single executable in `build/bin/fuknotion`

## Platform Support

### Linux
- Dependencies: GTK3, WebKit2GTK
- Package managers: apt, dnf, pacman
- WebView: WebKitGTK

### macOS
- Native WebView (WKWebView)
- No external dependencies
- App bundle: `fuknotion.app`

### Windows
- WebView: WebView2 (Chromium-based)
- Requires WebView2 runtime (installed by default on Windows 11)

## Security Considerations (Current)

1. **No network access** - Offline-first, no external APIs yet
2. **Local file system only** - Future: ~/.fuknotion/ directory
3. **IPC validation** - Wails handles type safety via bindings
4. **No secrets in code** - `.env.example` template for future credentials

## Performance Characteristics

### Startup Time
- Cold start: ~1-2 seconds
- Warm start: <1 second

### Memory Usage
- Base: ~50-100 MB (WebView + Go runtime)
- Scales with note count (future)

### IPC Overhead
- Negligible for single calls
- Future: Batch operations for large data transfers

## Future Enhancements

### Phase 02 - Core Architecture
- SQLite integration
- File system operations
- User profile storage

### Phase 03 - Authentication
- OAuth 2.0 flows
- Session management
- Multi-account support

### Phase 04 - Sync Engine
- Google Drive REST API
- CRDT-based conflict resolution
- Background sync workers

### Phase 05+ - Rich Editor
- BlockNote integration
- Real-time collaboration (local-first)
- Markdown import/export

## References

- Wails v2 docs: https://wails.io/docs/reference/cli
- Go project layout: https://github.com/golang-standards/project-layout
- React 18: https://react.dev/
- TypeScript strict mode: https://www.typescriptlang.org/tsconfig#strict
