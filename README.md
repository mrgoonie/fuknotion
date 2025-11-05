# Fuknotion

A Notion-like desktop note-taking app built with Wails (React + Go).

## Overview

Fuknotion is an offline-first desktop app with:
- Notion-like block-based editor
- Google Drive sync
- Multi-workspace support
- Cross-platform (Windows, macOS, Linux)

## Tech Stack

- **Frontend:** React 18, TypeScript, BlockNote editor, Tailwind CSS, Zustand
- **Backend:** Go 1.22+, SQLite with CR-SQLite extension
- **Desktop:** Wails v2
- **Sync:** Google Drive REST API
- **Auth:** OAuth 2.0 (Google, GitHub, Email)

## Prerequisites

- Go 1.22 or higher
- Node.js 18+ and npm
- Wails CLI v2.10.2+

**Note:** This project uses Wails v2 (stable), not v3 (alpha). Wails v3 requires Go 1.24+ and is still in alpha development.

### Installing Wails

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
wails doctor  # Verify installation
```

### Linux Dependencies

```bash
# Ubuntu/Debian
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev pkg-config

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel

# Arch
sudo pacman -S gtk3 webkit2gtk
```

## Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd fuknotion
```

### 2. Install Dependencies

```bash
# Go dependencies
go mod download

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Development Mode

```bash
wails dev
```

This will:
- Start the Go backend
- Launch Vite dev server with hot reload
- Open the app in development mode

### 4. Production Build

```bash
wails build
```

Executable will be in `build/bin/`

## Project Structure

```
fuknotion/
├── backend/                   # Go code
│   ├── cmd/
│   │   └── fuknotion/        # Main application
│   │       └── main.go       # Entry point
│   ├── internal/             # Private code
│   │   ├── app/              # App struct
│   │   ├── auth/             # Authentication
│   │   ├── database/         # SQLite operations
│   │   ├── sync/             # Google Drive sync
│   │   └── models/           # Data models
│   └── pkg/                  # Public libraries
│
├── frontend/                  # React app
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── stores/           # State management
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utilities
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── wailsjs/              # Auto-generated Go bindings
│   ├── package.json
│   └── tsconfig.json
│
├── build/                    # Build configs
├── wails.json               # Wails config
└── go.mod                   # Go dependencies
```

## Local Storage

```
~/.fuknotion/
├── user.db                    # User profile, workspaces list, auth
└── workspaces/
    ├── ws-{id}.db             # Workspace metadata (CRDT)
    └── notes/
        └── {note-id}.md       # Note content (YAML frontmatter)
```

## Available Commands

```bash
# Development
wails dev                # Start dev server with hot reload
wails dev -s             # Skip frontend (backend only)

# Building
wails build              # Build for current platform
wails build -clean       # Clean build
wails build -debug       # Build with debugging

# Code generation
wails generate module    # Generate TypeScript bindings

# Utilities
wails doctor             # Check dependencies
wails version            # Show version
```

## Development Workflow

1. Make changes to Go code in `backend/`
2. Make changes to React code in `frontend/src/`
3. Run `wails dev` - changes hot reload automatically
4. Test the Greet function to verify Go ↔ React communication
5. Build with `wails build` before committing

## Current Status

**Phase 01:** Project Setup & Scaffolding ✅ COMPLETE

- ✅ Wails project initialized
- ✅ Frontend (React + TypeScript + Tailwind) configured
- ✅ Backend (Go) structure created
- ✅ Basic app with Greet function working
- ✅ Development and production builds functional

**Next Steps:** Phase 02 - Core Architecture

## Troubleshooting

### "pattern all:frontend/dist: no matching files found"

Build the frontend first:
```bash
cd frontend
npm run build
cd ..
```

### "libwebkit2gtk-4.0-dev not found"

Install WebKit dependencies (see Linux Dependencies above)

### TypeScript bindings not found

Bindings are generated automatically during `wails dev`. If missing, run:
```bash
wails generate module
```

### Vite server fails to start

Check that port 34115 is available or change it in `frontend/vite.config.ts`

## Contributing

1. Follow the implementation plan in `/plans/`
2. Use YAGNI, KISS, and DRY principles
3. Run type checking before committing
4. Write tests for new features

## License

Copyright 2025 Fuknotion Team

## Implementation Plan

See detailed implementation plan in `/plans/251105-1107-fuknotion-implementation/plan.md`

Total: ~43 days across 17 phases
