# Phase 01: Project Setup & Scaffolding

**Phase:** 01/17
**Duration:** 2 days
**Priority:** Critical
**Dependencies:** None
**Status:** Complete

## Context

- **Parent Plan:** `plan.md`
- **Research:** `../reports/251105-researcher-wails-to-planner.md`
- **Related Phases:** Phase 02 (Core Architecture)

## Overview

Initialize Wails project with React + TypeScript frontend, configure Go backend, set up build system, establish project structure following KISS/DRY principles.

## Key Insights

- Wails v3 provides React-TS template out of box
- Apps are 90% smaller than Electron
- Native webview limits (no cookies, use OAuth)
- TypeScript bindings auto-generated from Go structs
- Cross-platform build from single codebase

## Requirements

### Functional

- Wails app initializes successfully
- Frontend renders React components
- Backend Go methods callable from frontend
- Hot reload works for development

### Non-Functional

- Project structure follows Wails conventions
- TypeScript strict mode enabled
- Go code follows standard formatting
- Build process documented
- Cross-platform compatible (Win/Mac/Linux)

## Architecture

**Project Structure:**
```
fuknotion/
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
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                   # Go code
│   ├── cmd/                  # Main applications
│   ├── internal/             # Private code
│   │   ├── app/              # App struct
│   │   ├── auth/             # Authentication
│   │   ├── database/         # SQLite operations
│   │   ├── sync/             # Google Drive sync
│   │   └── models/           # Data models
│   ├── pkg/                  # Public libraries
│   └── main.go               # Entry point
│
├── build/                    # Build configs
│   ├── darwin/              # macOS specific
│   ├── windows/             # Windows specific
│   └── linux/               # Linux specific
│
├── wails.json               # Wails config
├── go.mod
├── go.sum
└── README.md
```

## Related Code Files

### To Create

- `wails.json` - Wails project config
- `go.mod` - Go dependencies
- `frontend/package.json` - Node dependencies
- `frontend/tsconfig.json` - TypeScript config
- `backend/main.go` - Go entry point
- `backend/internal/app/app.go` - App struct
- `frontend/src/App.tsx` - React root
- `frontend/src/main.tsx` - Frontend entry
- `.gitignore` - Git ignore rules
- `README.md` - Project docs
- `.env.example` - Environment template

## Implementation Steps

### 1. Install Wails CLI

```bash
# Install Wails
go install github.com/wailsapp/wails/v3/cmd/wails@latest

# Verify installation
wails doctor
```

**Validation:** `wails version` shows v3.x.x

### 2. Initialize Project

```bash
# Create new Wails project
wails init -n fuknotion -t react-ts

cd fuknotion
```

**Template:** `react-ts` (React + TypeScript)

### 3. Configure Project Structure

**Update `wails.json`:**
```json
{
  "name": "fuknotion",
  "outputfilename": "fuknotion",
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev": "npm run dev",
  "author": {
    "name": "Fuknotion Team",
    "email": "team@fuknotion.com"
  },
  "info": {
    "companyName": "Fuknotion",
    "productName": "Fuknotion",
    "productVersion": "0.1.0",
    "copyright": "Copyright 2025",
    "comments": "Notion-like note-taking app"
  }
}
```

### 4. Setup Frontend Dependencies

**Update `frontend/package.json`:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@blocknote/core": "^0.12.0",
    "@blocknote/react": "^0.12.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Install:**
```bash
cd frontend
npm install
cd ..
```

### 5. Configure TypeScript

**Update `frontend/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

### 6. Setup Backend Structure

**Create `backend/internal/app/app.go`:**
```go
package app

import (
    "context"
)

// App struct
type App struct {
    ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
    return &App{}
}

// Startup is called when the app starts
func (a *App) Startup(ctx context.Context) {
    a.ctx = ctx
}

// Shutdown is called when the app is closing
func (a *App) Shutdown(ctx context.Context) {
    // Cleanup
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
    return "Hello " + name + ", welcome to Fuknotion!"
}
```

**Update `backend/main.go`:**
```go
package main

import (
    "embed"
    "log"

    "github.com/wailsapp/wails/v3/pkg/application"
    "fuknotion/backend/internal/app"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
    // Create application
    app := application.New(application.Options{
        Name:        "Fuknotion",
        Description: "Notion-like note-taking app",
        Assets:      application.AssetOptions{FS: assets},
        Mac: application.MacOptions{
            ApplicationShouldTerminateAfterLastWindowClosed: true,
        },
    })

    // Create app instance
    myApp := app.NewApp()

    // Create window
    app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
        Title:  "Fuknotion",
        Width:  1200,
        Height: 800,
        Mac: application.MacWindow{
            InvisibleTitleBarHeight: 50,
            Backdrop:                application.MacBackdropTranslucent,
            TitleBar:                application.MacTitleBarHiddenInset,
        },
        BackgroundColour: application.NewRGB(255, 255, 255),
        URL:              "/",
    })

    // Bind methods
    app.Bind(myApp)

    // Run application
    err := app.Run()
    if err != nil {
        log.Fatal(err)
    }
}
```

### 7. Setup Tailwind CSS

**Create `frontend/tailwind.config.js`:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Update `frontend/src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 8. Create Basic React App

**Update `frontend/src/App.tsx`:**
```tsx
import { useState } from 'react';
import { Greet } from '../wailsjs/go/app/App';

function App() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  const handleGreet = async () => {
    const result = await Greet(name);
    setGreeting(result);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Fuknotion</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border p-2 rounded w-full mb-4"
        />
        <button
          onClick={handleGreet}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Greet
        </button>
        {greeting && (
          <p className="mt-4 text-gray-700">{greeting}</p>
        )}
      </div>
    </div>
  );
}

export default App;
```

### 9. Configure Git

**Create `.gitignore`:**
```
# Wails
build/bin
frontend/dist
frontend/node_modules

# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/

# IDE
.idea
.vscode
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
```

### 10. Test Build

```bash
# Development mode
wails dev

# Production build
wails build

# Test on current platform
./build/bin/fuknotion
```

**Validation:**
- App launches successfully
- Frontend renders
- Greet function works (Go ↔ React communication)
- No console errors

## Todo List

- [x] Install Wails CLI
- [x] Initialize Wails project
- [x] Configure project structure
- [x] Setup frontend dependencies
- [x] Configure TypeScript strict mode
- [x] Setup backend structure (RESOLVED: main.go moved to backend/cmd/fuknotion/)
- [x] Setup Tailwind CSS
- [x] Create basic React app
- [x] Configure Git
- [x] Test dev build (VERIFIED: Go compilation successful)
- [x] Test production build (VERIFIED: Build successful)
- [x] Document setup process in README
- [x] Create .env.example

**BLOCKER RESOLVED:** main.go moved to backend/cmd/fuknotion/main.go. Go internal package imports now working correctly.

## Success Criteria

- [x] Wails app initializes without errors ✅
- [x] `wails dev` launches app with hot reload ✅
- [x] `wails build` produces executable ✅
- [x] Go → React communication works ✅
- [x] TypeScript strict mode enabled ✅
- [x] Tailwind CSS working ✅
- [x] Project structure follows conventions ✅
- [x] Git repository initialized ✅
- [x] README documents setup steps ✅

**Code Review:** See `/mnt/d/www/fuknotion/plans/reports/251105-code-reviewer-phase01-to-main.md`
**Approval Status:** APPROVED (critical issue resolved)

## Risk Assessment

**Risk:** Wails version incompatibility
**Mitigation:** Use latest stable v3, check `wails doctor`

**Risk:** Platform-specific build issues
**Mitigation:** Test on target platforms early, document platform requirements

**Risk:** TypeScript binding generation failures
**Mitigation:** Follow Go naming conventions (exported methods), regenerate with `wails dev -s`

## Security Considerations

- No sensitive data in repo (use .env.example)
- .gitignore prevents credential commits
- TypeScript strict mode catches type errors
- Go error handling from day one

## Next Steps

After Phase 01 completion:
1. Proceed to Phase 02 (Core Architecture)
2. Implement state management (Zustand)
3. Setup routing structure
4. Create file system layer
