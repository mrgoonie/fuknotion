# Fuknotion

A **Notion-like note-taking desktop app** for Windows & macOS, built with Wails (React + Go).

## 🎯 Vision

Fuknotion brings Notion's powerful block-based editing experience to the desktop with offline-first architecture, Google Drive sync, and lightning-fast performance.

## ✨ Features (Planned)

### Core Features
- **Block-based Editor** - Notion-like WYSIWYG markdown editor (using BlockNote)
- **Multi-workspace** - Organize notes across workspaces with member collaboration
- **Offline-first** - Works seamlessly offline, syncs to Google Drive when online
- **Cross-platform** - Native desktop experience on Windows & macOS

### UI/UX
- **Left Sidebar** - Search, quick actions, favorites, nested folders, settings, trash
- **Right Sidebar** - AI assistant (coming soon)
- **Tabs** - Open multiple notes, drag to reorder
- **Themes** - Light & dark mode with warm color palette
- **Search** - Fast full-text search (`Ctrl/Cmd + K`)

### Editor Capabilities
- All Markdown syntax (headings, lists, tables, code blocks, callouts)
- Mini floating toolbar on text selection
- Drag & drop blocks to reorder
- Multi-column layouts (1-4 columns)
- Syntax highlighting for code
- Internal links with `#` shortcut
- `@` mentions for workspace members
- Block folding (collapse/expand)
- Copy as: formatted, markdown, plain text

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **BlockNote** - Block-based editor
- **TailwindCSS** + **shadcn/ui** - Styling & components
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Zustand** - State management
- **dnd-kit** - Drag & drop

### Backend (Go)
- **Wails v2** - Desktop framework
- **modernc.org/sqlite** - Local database (CGO-free)
- **Goldmark** - Markdown parsing
- **Google Drive API** - Cloud sync
- **OAuth 2.0** - Authentication

## 📦 Project Structure

```
fuknotion/
├── backend/
│   ├── database/       # SQLite operations (notes, workspaces, sync)
│   ├── sync/          # Google Drive sync (coming soon)
│   ├── markdown/      # Goldmark processing (coming soon)
│   └── models/        # Data models
├── frontend/
│   ├── src/
│   │   ├── components/ # React components (coming soon)
│   │   ├── stores/     # Zustand state (coming soon)
│   │   └── lib/        # Utilities
│   ├── dist/          # Build output
│   └── wailsjs/       # Wails bindings
├── docs/              # Documentation
│   ├── design-guidelines.md
│   ├── wireframe/
│   └── ...
├── plans/             # Implementation plans & research
├── app.go             # Main app logic
├── main.go            # Entry point
├── go.mod             # Go dependencies
└── wails.json         # Wails config
```

## 🚀 Development Setup

### Prerequisites
- **Go 1.22+** - [Install Go](https://go.dev/dl/)
- **Node.js 18+** - [Install Node.js](https://nodejs.org/)
- **Wails CLI** - `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd fuknotion

# Install Go dependencies
go mod download

# Install frontend dependencies
cd frontend
npm install
cd ..

# Run in development mode
wails dev
```

### Available Commands

```bash
# Development mode (hot reload)
wails dev

# Build for production
wails build

# Build for specific platform
wails build -platform windows/amd64
wails build -platform darwin/universal

# Run frontend separately (for testing)
cd frontend && npm run dev

# Compile Go backend
go build -o fuknotion .
```

## 📊 Current Status

**Phase 0 Complete** ✅
- [x] Project initialization (Wails v2 with React TypeScript)
- [x] Go backend structure (database, models)
- [x] SQLite database with migrations (workspaces, notes, members, sync)
- [x] Note CRUD operations (create, read, update, delete, favorite)
- [x] Workspace management
- [x] Frontend dependencies (BlockNote, TailwindCSS, shadcn/ui, etc.)
- [x] TailwindCSS + design system variables
- [x] Vite config for Wails HMR

**Next Steps**
- [ ] Phase 1: Basic UI (sidebar, editor integration, tabs)
- [ ] Phase 2: Editor features (slash commands, drag-drop, internal links)
- [ ] Phase 3: Google Drive sync & OAuth
- [ ] Phase 4: Multi-tenant & member management
- [ ] Phase 5: Polish (themes, search, accessibility)

## 📚 Documentation

- [Implementation Plan](./plans/251028-implementation-plan.md) - 12-week roadmap
- [Design Guidelines](./docs/design-guidelines.md) - Complete design system
- [Research Reports](./plans/research/) - Tech stack analysis (6 reports)

## 🎨 Design Philosophy

- **YAGNI** (You Aren't Gonna Need It) - Build what's needed now
- **KISS** (Keep It Simple, Stupid) - Prioritize simplicity
- **DRY** (Don't Repeat Yourself) - Reusable, modular code
- **Offline-first** - Local database as source of truth
- **Keyboard-driven** - Fast shortcuts for power users
- **Accessible** - WCAG AA compliance

## 🔐 Data Storage

- **Local**: `~/.fuknotion/` directory
  - `fuknotion.db` - SQLite database (WAL mode)
  - Markdown files cached locally
- **Cloud**: Google Drive (coming soon)
  - Sync queue for offline changes
  - Conflict resolution with three-way merge

## 🧪 Testing

```bash
# Run Go tests
go test ./...

# Run frontend tests (coming soon)
cd frontend && npm test

# E2E tests (coming soon)
npm run test:e2e
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! See CONTRIBUTING.md for guidelines.

## 📧 Contact

- Issues: [GitHub Issues](https://github.com/yourusername/fuknotion/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/fuknotion/discussions)

---

**Built with ❤️ using Wails, React, and Go**
