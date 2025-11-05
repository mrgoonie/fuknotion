# Code Standards

**Last Updated:** 2025-11-05
**Phase:** 01 - Project Setup & Scaffolling (Complete)
**Version:** 0.1.0

## Overview

Code standards for Fuknotion project. Enforces consistency across TypeScript frontend and Go backend. Follows YAGNI, KISS, DRY principles.

---

## TypeScript Standards

### Compiler Configuration

#### Strict Mode (Enabled)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

All strict checks enforced:
- `strictNullChecks` - No implicit null/undefined
- `strictFunctionTypes` - Function parameter contravariance
- `strictBindCallApply` - Type-safe bind/call/apply
- `strictPropertyInitialization` - Class properties must be initialized
- `noImplicitAny` - Explicit types required
- `noImplicitThis` - Explicit `this` typing

### Naming Conventions

#### Files
- Components: PascalCase (`App.tsx`, `NoteEditor.tsx`)
- Utils/hooks: camelCase (`useWorkspace.ts`, `formatDate.ts`)
- Types: PascalCase (`types/User.ts`, `types/Workspace.ts`)
- Constants: UPPER_SNAKE_CASE file, named export (`constants/API_ENDPOINTS.ts`)

#### Variables
- **camelCase** for most identifiers
- **PascalCase** for components, classes, types, interfaces
- **UPPER_SNAKE_CASE** for constants

```typescript
// Good
const userName = "John";
const MAX_RETRIES = 3;
interface UserProfile {}
type WorkspaceId = string;

// Bad
const UserName = "John";
const max_retries = 3;
interface userProfile {}
```

#### Functions
- **camelCase** for regular functions
- **PascalCase** for React components

```typescript
// Good
function formatDate(date: Date): string {}
const NoteEditor: React.FC = () => {};

// Bad
function FormatDate(date: Date): string {}
const note_editor: React.FC = () => {};
```

### Type Definitions

#### Prefer Interfaces for Objects
```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Acceptable for unions/primitives
type UserId = string;
type Status = 'active' | 'inactive';
```

#### No Implicit Any
```typescript
// Bad
function process(data) {
  return data.map(item => item.value);
}

// Good
function process(data: Item[]): number[] {
  return data.map(item => item.value);
}
```

#### Explicit Return Types
```typescript
// Good
function getUser(id: string): Promise<User> {
  return fetch(`/users/${id}`).then(r => r.json());
}

// Bad
function getUser(id: string) {
  return fetch(`/users/${id}`).then(r => r.json());
}
```

### React Patterns

#### Functional Components
```typescript
// Good - Explicit FC type
const App: React.FC = () => {
  return <div>App</div>;
};

// Good - Props interface
interface NoteEditorProps {
  noteId: string;
  onSave: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onSave }) => {
  return <div>Editor</div>;
};
```

#### Hooks
- Use `useState`, `useEffect`, `useMemo` for state/effects
- Custom hooks: prefix with `use` (e.g., `useWorkspace`, `useAuth`)
- Extract complex logic into custom hooks

```typescript
// Good
function useWorkspace(id: string) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    loadWorkspace(id).then(setWorkspace);
  }, [id]);

  return workspace;
}
```

#### Event Handlers
- Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)
- Inline for trivial logic, extract for complex logic

```typescript
// Good
const handleGreet = async () => {
  try {
    const result = await Greet(name);
    setGreeting(result);
  } catch (error) {
    console.error('Error calling Greet:', error);
  }
};
```

### Path Aliases

Use `@/` prefix for absolute imports:
```typescript
// Good
import { formatDate } from '@/utils/date';
import { User } from '@/types/User';

// Bad
import { formatDate } from '../../../utils/date';
```

### Error Handling

#### Try-Catch for Async Operations
```typescript
// Good
const handleSave = async () => {
  try {
    await saveNote(content);
  } catch (error) {
    console.error('Failed to save:', error);
    setError('Save failed');
  }
};

// Bad
const handleSave = async () => {
  await saveNote(content); // Unhandled rejection
};
```

---

## Go Standards

### Project Layout

Follow standard Go project layout:
```
backend/
├── cmd/
│   └── fuknotion/         # Main application
│       └── main.go        # Entry point only, no logic
├── internal/              # Private code
│   ├── app/               # App struct, lifecycle
│   ├── auth/              # Authentication (future)
│   ├── database/          # Database operations (future)
│   └── models/            # Data structures (future)
└── pkg/                   # Public libraries (future)
```

### Naming Conventions

#### Files
- Lowercase, single word: `app.go`, `user.go`
- Multi-word: snake_case (`user_profile.go`, `note_sync.go`)
- Test files: `_test.go` suffix

#### Packages
- Lowercase, single word: `app`, `auth`, `database`
- Match directory name
- No underscores, hyphens, mixedCaps

#### Variables/Functions
- **camelCase** for private (unexported)
- **PascalCase** for public (exported)

```go
// Good
type App struct {
    ctx context.Context  // private field
}

func NewApp() *App {}    // public constructor
func (a *App) Greet(name string) string {}  // public method

// Bad
type app struct {}       // lowercase type (unexported)
func new_app() *App {}   // snake_case
```

### Exported Methods (Wails Bindings)

All exported methods on bound structs auto-exposed to frontend:
```go
// Exposed to frontend
func (a *App) Greet(name string) string {}
func (a *App) SaveNote(content string) error {}

// NOT exposed (unexported)
func (a *App) validateInput(s string) bool {}
```

### Error Handling

#### Return Errors, Don't Panic
```go
// Good
func SaveNote(content string) error {
    if content == "" {
        return errors.New("content cannot be empty")
    }
    // ...
    return nil
}

// Bad
func SaveNote(content string) {
    if content == "" {
        panic("content cannot be empty")
    }
}
```

#### Check All Errors
```go
// Good
err := wails.Run(&options.App{...})
if err != nil {
    log.Fatal("Error:", err)
}

// Bad
wails.Run(&options.App{...}) // ignoring error
```

### Context Usage

Always accept context for lifecycle methods:
```go
// Good
func (a *App) Startup(ctx context.Context) {
    a.ctx = ctx
}

func (a *App) Shutdown(ctx context.Context) {
    // Cleanup resources
}
```

### Struct Initialization

Use constructor functions for structs:
```go
// Good
func NewApp() *App {
    return &App{}
}

// Usage
myApp := app.NewApp()

// Bad
myApp := &app.App{} // direct initialization
```

### Comments

#### Package Comments
```go
// Package app provides the core application logic for Fuknotion.
package app
```

#### Exported Declarations
```go
// App struct manages application lifecycle and exposes methods to frontend.
type App struct {
    ctx context.Context
}

// Greet returns a greeting message for the given name.
func (a *App) Greet(name string) string {
    return "Hello " + name + ", welcome to Fuknotion!"
}
```

### Formatting

Use `gofmt` (auto-applied by Go tooling):
- Tabs for indentation
- No line length limit (but keep readable)
- Opening braces on same line

---

## File Organization

### Frontend Directory Structure
```
frontend/src/
├── components/         # UI components
│   ├── common/         # Shared components (Button, Input)
│   ├── editor/         # Editor-specific components
│   └── sidebar/        # Sidebar components
├── hooks/              # Custom React hooks
├── services/           # API service layer (Wails bindings wrappers)
├── stores/             # Zustand state stores
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

### Backend Directory Structure
```
backend/
├── cmd/
│   └── fuknotion/
│       └── main.go     # Entry point only
├── internal/
│   ├── app/            # App struct
│   ├── auth/           # Authentication logic
│   ├── database/       # SQLite operations
│   ├── sync/           # Google Drive sync
│   └── models/         # Data structures
└── pkg/                # Reusable libraries (if needed)
```

---

## Build & Development

### Frontend Scripts (package.json)
```json
{
  "scripts": {
    "dev": "vite",                    // Dev server
    "build": "tsc && vite build",     // Type check + build
    "preview": "vite preview"         // Preview production build
  }
}
```

### Development Workflow
1. Run `wails dev` (starts both frontend and backend)
2. Make changes to React/Go code
3. Hot reload automatically applies changes
4. Type check before committing: `cd frontend && npm run build`

### Pre-Commit Checks
- TypeScript: `tsc --noEmit` (type check without output)
- Go: `go build ./...` (ensure compilation)
- Format: `gofmt -w .` (Go), Prettier (TypeScript, optional)

---

## Testing (Future)

### TypeScript Tests
- Framework: Vitest or Jest
- File naming: `*.test.ts`, `*.spec.ts`
- Location: Next to source files or `__tests__/` directory

### Go Tests
- File naming: `*_test.go`
- Run: `go test ./...`
- Table-driven tests for multiple cases

---

## Git Workflow

### Commit Messages
- Conventional Commits format:
  - `feat: add user authentication`
  - `fix: resolve sync conflict issue`
  - `docs: update API documentation`
  - `chore: update dependencies`

### Branch Naming
- Feature: `feature/note-editor`
- Bugfix: `fix/sync-error`
- Chore: `chore/update-deps`

---

## Configuration Files

### `.gitignore`
- Wails artifacts: `build/bin`, `frontend/dist`, `frontend/wailsjs`
- Dependencies: `node_modules`, `vendor/`
- Environment files: `.env` (except `.env.example`)
- IDE files: `.vscode`, `.idea`

### `.env.example`
- Template for environment variables
- No actual secrets
- Copy to `.env` for local development

---

## Security

### TypeScript
- No hardcoded secrets
- Validate all user input
- Sanitize HTML before rendering (use React's default escaping)

### Go
- No secrets in code (use environment variables)
- Validate input parameters on exported methods
- Use context for cancellation/timeouts

---

## Performance

### TypeScript
- Use `React.memo()` for expensive components
- Debounce/throttle user input
- Lazy load large components with `React.lazy()`

### Go
- Avoid blocking operations in exported methods
- Use goroutines for background tasks (future)
- Close resources in `Shutdown()` lifecycle hook

---

## Documentation

### Code Comments
- Document exported functions/types
- Explain "why" not "what"
- Update comments when code changes

### README/Docs
- Keep `/docs/` updated with architecture changes
- Document breaking changes in commit messages
- Update `README.md` for new features

---

## Principles

### YAGNI (You Aren't Gonna Need It)
- Don't add features until required
- No speculative abstractions
- Current example: BlockNote/Zustand installed but not used yet

### KISS (Keep It Simple, Stupid)
- Simplest solution wins
- Avoid over-engineering
- Refactor only when necessary

### DRY (Don't Repeat Yourself)
- Extract reusable logic into functions/hooks
- Share types between components
- Use constants for magic values

---

## Editor Configuration (Recommended)

### VSCode
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "go.formatTool": "gofmt"
}
```

### Extensions
- **TypeScript:** ESLint, Prettier
- **Go:** Go extension (gopls language server)
- **Wails:** No specific extension needed

---

## Future Additions

As project grows, add:
- ESLint configuration (`eslintrc.json`)
- Prettier configuration (`.prettierrc`)
- Husky for pre-commit hooks
- CI/CD linting pipelines

---

## Examples

### Good TypeScript Example
```typescript
// frontend/src/services/noteService.ts
import { SaveNote } from '@/wailsjs/go/app/App';
import type { Note } from '@/types/Note';

export async function saveNote(note: Note): Promise<void> {
  try {
    await SaveNote(JSON.stringify(note));
  } catch (error) {
    console.error('Failed to save note:', error);
    throw new Error('Save operation failed');
  }
}
```

### Good Go Example
```go
// backend/internal/app/note.go
package app

import (
    "encoding/json"
    "errors"
)

// SaveNote persists a note to the database.
func (a *App) SaveNote(noteJSON string) error {
    if noteJSON == "" {
        return errors.New("note content cannot be empty")
    }

    var note Note
    if err := json.Unmarshal([]byte(noteJSON), &note); err != nil {
        return err
    }

    // Save logic here
    return nil
}
```

---

## References

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Go Code Review Comments: https://github.com/golang/go/wiki/CodeReviewComments
- React Best Practices: https://react.dev/learn
- Wails Bindings: https://wails.io/docs/reference/runtime/intro
