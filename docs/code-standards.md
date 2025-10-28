# Fuknotion Code Standards

**Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Active

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Go Standards](#go-standards)
3. [TypeScript/React Standards](#typescriptreact-standards)
4. [File Organization](#file-organization)
5. [Naming Conventions](#naming-conventions)
6. [Error Handling](#error-handling)
7. [Testing Requirements](#testing-requirements)
8. [Documentation Standards](#documentation-standards)
9. [Git Workflow](#git-workflow)
10. [Code Review Checklist](#code-review-checklist)

---

## Philosophy

### Core Principles

**YAGNI (You Aren't Gonna Need It)**
- Build only what's needed now
- Don't add features "just in case"
- Example: No database tables until feature implemented

**KISS (Keep It Simple, Stupid)**
- Prefer simple solutions over complex ones
- Example: File-level sync (not CRDT) for MVP

**DRY (Don't Repeat Yourself)**
- Reusable components and utilities
- Example: Single editor component for all notes

**Readable Code > Clever Code**
- Code is read 10x more than written
- Clear variable names over cryptic abbreviations
- Comments explain "why", not "what"

---

## Go Standards

### General Guidelines

Follow official Go conventions:
- [Effective Go](https://golang.org/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)

### Naming Conventions

**Packages:**
- Lowercase, single word (no underscores)
- Example: `database`, `models`, `sync`

**Types:**
- PascalCase for exported types
- camelCase for unexported types
- Example: `Note`, `Workspace`, `noteCache`

**Functions:**
- PascalCase for exported functions
- camelCase for unexported functions
- Verb-noun pattern: `CreateNote`, `GetWorkspace`
- Example: `CreateNote`, `validateEmail`

**Variables:**
- camelCase for all variables
- Descriptive names (no single-letter except loops)
- Example: `workspaceID`, `createdAt`

**Constants:**
- PascalCase or SCREAMING_SNAKE_CASE
- Example: `MaxRetries`, `DEFAULT_TIMEOUT`

**Acronyms:**
- Keep uppercase: `ID`, `URL`, `HTTP`, `DB`
- Example: `workspaceID` (not `workspaceId`)

### Code Structure

**File Organization:**
```go
package database

// 1. Imports (stdlib first, then third-party, then local)
import (
    "database/sql"
    "fmt"
    "time"

    "github.com/google/uuid"

    "fuknotion/backend/models"
)

// 2. Constants
const MaxRetries = 5

// 3. Types
type DB struct {
    conn *sql.DB
}

// 4. Constructor
func NewDB(dataDir string) (*DB, error) { ... }

// 5. Public methods (alphabetical)
func (db *DB) CreateNote(...) { ... }
func (db *DB) GetNote(...) { ... }

// 6. Private methods (alphabetical)
func (db *DB) migrate() error { ... }
```

**Function Size:**
- Max 50 lines per function (guideline, not strict)
- Extract complex logic into helper functions
- One level of abstraction per function

**Error Handling:**
```go
// ✅ Good: Wrap errors with context
func CreateNote(...) (*models.Note, error) {
    _, err := db.conn.Exec(query, ...)
    if err != nil {
        return nil, fmt.Errorf("failed to create note: %w", err)
    }
    return note, nil
}

// ❌ Bad: Swallow errors
func CreateNote(...) *models.Note {
    db.conn.Exec(query, ...)  // Error ignored
    return note
}

// ❌ Bad: Return naked errors
func CreateNote(...) (*models.Note, error) {
    _, err := db.conn.Exec(query, ...)
    return note, err  // No context
}
```

**Comments:**
```go
// ✅ Good: Package comment in doc.go
// Package database provides SQLite operations for notes and workspaces.
package database

// ✅ Good: Function comment describes purpose
// CreateNote inserts a new note into the database with auto-generated ID.
// Returns error if workspace doesn't exist or database write fails.
func CreateNote(workspaceID, title, content string) (*models.Note, error) {
    ...
}

// ✅ Good: Comment explains "why", not "what"
// Use UUID instead of auto-increment for distributed sync
note.ID = uuid.New().String()

// ❌ Bad: Obvious comment
// Set the ID
note.ID = uuid.New().String()
```

### Database Patterns

**Query Formatting:**
```go
// ✅ Good: Multi-line query for readability
query := `
    SELECT id, workspace_id, title, content, created_at, updated_at
    FROM notes
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY updated_at DESC
`

// ❌ Bad: Long single-line query
query := "SELECT id, workspace_id, title, content, created_at, updated_at FROM notes WHERE workspace_id = ? AND is_deleted = 0 ORDER BY updated_at DESC"
```

**Prepared Statements:**
```go
// ✅ Good: Use placeholders (prevents SQL injection)
db.conn.Exec("SELECT * FROM notes WHERE id = ?", id)

// ❌ Bad: String interpolation
db.conn.Exec(fmt.Sprintf("SELECT * FROM notes WHERE id = '%s'", id))
```

**Resource Cleanup:**
```go
// ✅ Good: Defer close immediately after open
rows, err := db.conn.Query(query)
if err != nil {
    return nil, err
}
defer rows.Close()

// Iterate rows...
```

### Testing

**File Naming:**
- Test files: `*_test.go`
- Example: `notes.go` → `notes_test.go`

**Test Function Names:**
- `TestFunctionName_Scenario`
- Example: `TestCreateNote_Success`, `TestCreateNote_InvalidWorkspace`

**Test Structure (Table-Driven):**
```go
func TestCreateNote(t *testing.T) {
    tests := []struct {
        name        string
        workspaceID string
        title       string
        wantErr     bool
    }{
        {"success", "ws-1", "My Note", false},
        {"empty_title", "ws-1", "", false},
        {"invalid_workspace", "invalid", "Note", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            db := setupTestDB(t)
            defer db.Close()

            note, err := db.CreateNote(tt.workspaceID, tt.title, "content", nil)

            if (err != nil) != tt.wantErr {
                t.Errorf("CreateNote() error = %v, wantErr %v", err, tt.wantErr)
            }
            if !tt.wantErr && note.Title != tt.title {
                t.Errorf("Title = %v, want %v", note.Title, tt.title)
            }
        })
    }
}
```

---

## TypeScript/React Standards

### General Guidelines

Follow:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)

### Naming Conventions

**Components:**
- PascalCase: `Editor`, `Sidebar`, `TabBar`
- File name matches component: `Editor.tsx`

**Hooks:**
- camelCase with `use` prefix: `useAutoSave`, `useDebounce`

**Functions:**
- camelCase: `handleSave`, `fetchNotes`
- Event handlers: `handle` prefix (handleClick, handleChange)

**Variables:**
- camelCase: `activeNote`, `isLoading`

**Constants:**
- SCREAMING_SNAKE_CASE: `MAX_TABS`, `DEFAULT_THEME`

**Types/Interfaces:**
- PascalCase: `Note`, `EditorProps`
- Props suffix for component props: `EditorProps`

### Component Structure

**Functional Component Template:**
```tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNoteStore } from '@/stores/noteStore'

interface EditorProps {
  noteId: string
  onSave?: (content: string) => void
}

export function Editor({ noteId, onSave }: EditorProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [content, setContent] = useState('')
  const { activeNote, updateNote } = useNoteStore()

  // 2. Derived state
  const isEmpty = content.trim() === ''

  // 3. Effects
  useEffect(() => {
    // Load note content
  }, [noteId])

  // 4. Event handlers
  const handleSave = async () => {
    await updateNote(noteId, content)
    onSave?.(content)
  }

  // 5. Render
  return (
    <div className="editor">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <Button onClick={handleSave} disabled={isEmpty}>
        Save
      </Button>
    </div>
  )
}
```

**Component Organization:**
- One component per file
- Max 300 lines per component (extract sub-components)
- Co-locate related components (Editor/Editor.tsx, Editor/Toolbar.tsx)

### TypeScript Best Practices

**Type Definitions:**
```tsx
// ✅ Good: Define explicit types
interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
}

// ✅ Good: Use union types
type Theme = 'light' | 'dark' | 'system'

// ✅ Good: Nullable with question mark
interface EditorProps {
  noteId: string
  onSave?: (content: string) => void  // Optional
}

// ❌ Bad: Use any
const note: any = await fetchNote()

// ❌ Bad: Implicit any
function updateNote(note) { ... }
```

**Generics:**
```tsx
// ✅ Good: Generic hook
function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // ...
}

const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system')
```

**Type Guards:**
```tsx
// ✅ Good: Type guard for narrowing
function isNote(obj: unknown): obj is Note {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

### React Patterns

**State Management:**
```tsx
// ✅ Good: Local state for UI-only state
const [isOpen, setIsOpen] = useState(false)

// ✅ Good: Zustand for shared state
const { notes, createNote } = useNoteStore()

// ❌ Bad: Prop drilling more than 2 levels
<Parent>
  <Child>
    <GrandChild>
      <GreatGrandChild notes={notes} />  // Too deep
    </GrandChild>
  </Child>
</Parent>
```

**Effects:**
```tsx
// ✅ Good: Cleanup in effects
useEffect(() => {
  const timer = setTimeout(() => {
    // Do something
  }, 1000)

  return () => clearTimeout(timer)  // Cleanup
}, [])

// ✅ Good: Dependencies array
useEffect(() => {
  fetchNote(noteId)
}, [noteId])  // Re-run when noteId changes

// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchNote(noteId)
}, [])  // noteId changes won't trigger effect
```

**Conditional Rendering:**
```tsx
// ✅ Good: Early return for loading states
if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!note) return <EmptyState />

return <Editor note={note} />

// ✅ Good: Ternary for simple conditions
<Button disabled={isLoading ? true : false}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// ❌ Bad: Nested ternaries
<Button>
  {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
</Button>
```

**Custom Hooks:**
```tsx
// ✅ Good: Extract reusable logic
function useAutoSave(value: string, onSave: (value: string) => void, delay = 2000) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, onSave, delay])
}

// Usage
useAutoSave(content, handleSave, 2000)
```

### Styling

**Tailwind Classes:**
```tsx
// ✅ Good: Readable class names
<div className="flex items-center gap-2 p-4 rounded-lg bg-surface hover:bg-surface-elevated">
  ...
</div>

// ✅ Good: Conditional classes with clsx/cn
import { cn } from '@/lib/utils'

<Button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-accent text-accent-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click me
</Button>

// ❌ Bad: Inline styles (avoid unless necessary)
<div style={{ padding: '16px', backgroundColor: '#fff' }}>
  ...
</div>
```

---

## File Organization

### Directory Structure

```
fuknotion/
├── backend/
│   ├── database/          # Database operations
│   │   ├── database.go    # DB initialization
│   │   ├── notes.go       # Note CRUD
│   │   └── workspaces.go  # Workspace CRUD
│   ├── models/            # Data models
│   │   └── types.go       # All models in one file
│   ├── sync/              # Google Drive sync
│   │   ├── oauth.go       # OAuth flow
│   │   ├── drive.go       # Drive API
│   │   └── queue.go       # Sync queue
│   └── markdown/          # Markdown processing
│       └── parser.go      # Goldmark config
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── Editor/    # Editor components
│   │   │   │   ├── Editor.tsx
│   │   │   │   └── Toolbar.tsx
│   │   │   ├── Sidebar/
│   │   │   │   └── Sidebar.tsx
│   │   │   └── Tabs/
│   │   │       └── TabBar.tsx
│   │   ├── stores/        # Zustand stores
│   │   │   ├── noteStore.ts
│   │   │   └── workspaceStore.ts
│   │   ├── hooks/         # Custom hooks
│   │   │   ├── useAutoSave.ts
│   │   │   └── useDebounce.ts
│   │   ├── lib/           # Utilities
│   │   │   └── utils.ts
│   │   ├── styles/        # Global styles
│   │   │   └── globals.css
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   └── wailsjs/           # Auto-generated (DO NOT EDIT)
└── docs/                  # Documentation
```

### File Naming

**Go:**
- Lowercase with underscores: `database.go`, `notes_test.go`
- Package name matches directory: `database/database.go`

**TypeScript/React:**
- PascalCase for components: `Editor.tsx`, `Sidebar.tsx`
- camelCase for utilities: `utils.ts`, `api.ts`
- kebab-case for CSS: `globals.css`, `editor.css`

---

## Naming Conventions

### General Rules

**Be Descriptive:**
```go
// ✅ Good
func CreateWorkspace(name string) (*models.Workspace, error)
const MaxRetryAttempts = 5

// ❌ Bad
func CW(n string) (*models.Workspace, error)
const MRA = 5
```

**Avoid Abbreviations:**
```go
// ✅ Good
workspaceID, createdAt, userEmail

// ❌ Bad (unless widely known)
wsID, crAt, usrEml
```

**Boolean Prefixes:**
```go
// ✅ Good
isLoading, hasError, canEdit, shouldSync

// ❌ Bad
loading, error, edit, sync
```

### JSON Field Naming

Go structs use JSON tags for camelCase:
```go
// ✅ Good: JSON field names match TypeScript convention
type Note struct {
    ID          string `json:"id"`
    WorkspaceID string `json:"workspaceId"`  // camelCase
    CreatedAt   time.Time `json:"createdAt"`
}

// ❌ Bad: Inconsistent naming
type Note struct {
    ID          string `json:"ID"`           // Not camelCase
    WorkspaceID string `json:"workspace_id"` // snake_case
}
```

---

## Error Handling

### Go Error Handling

**Always Check Errors:**
```go
// ✅ Good
note, err := db.CreateNote(...)
if err != nil {
    return nil, fmt.Errorf("failed to create note: %w", err)
}

// ❌ Bad
note, _ := db.CreateNote(...)  // Error ignored
```

**Wrap Errors with Context:**
```go
// ✅ Good: Use %w for error wrapping
if err := db.migrate(); err != nil {
    return nil, fmt.Errorf("failed to run migrations: %w", err)
}

// ❌ Bad: Lose stack trace
if err := db.migrate(); err != nil {
    return nil, errors.New("migration failed")
}
```

**Custom Error Types:**
```go
// ✅ Good: Define custom errors
var ErrNotFound = errors.New("note not found")
var ErrInvalidWorkspace = errors.New("workspace does not exist")

func GetNote(id string) (*models.Note, error) {
    // ...
    if err == sql.ErrNoRows {
        return nil, ErrNotFound
    }
    return note, nil
}
```

### TypeScript Error Handling

**Try-Catch for Async:**
```tsx
// ✅ Good
const handleSave = async () => {
  try {
    await updateNote(noteId, content)
    toast.success('Note saved')
  } catch (error) {
    console.error('Failed to save note:', error)
    toast.error('Failed to save note')
  }
}

// ❌ Bad: Unhandled promise rejection
const handleSave = async () => {
  await updateNote(noteId, content)  // Error not caught
}
```

**Type-Safe Error Handling:**
```tsx
// ✅ Good: Type guard for errors
function isError(error: unknown): error is Error {
  return error instanceof Error
}

try {
  // ...
} catch (error) {
  if (isError(error)) {
    console.error(error.message)
  }
}
```

---

## Testing Requirements

### Test Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: Critical paths (CRUD, sync)
- E2E tests: User workflows (create note, edit, save)

### Go Testing

**Test File Structure:**
```go
// notes_test.go
package database

import "testing"

func setupTestDB(t *testing.T) *DB {
    t.Helper()
    db, err := NewDB(t.TempDir())
    if err != nil {
        t.Fatalf("Failed to setup test DB: %v", err)
    }
    return db
}

func TestCreateNote_Success(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()

    note, err := db.CreateNote("ws-1", "Test Note", "Content", nil)
    if err != nil {
        t.Errorf("CreateNote() error = %v", err)
    }
    if note.Title != "Test Note" {
        t.Errorf("Title = %v, want %v", note.Title, "Test Note")
    }
}
```

### TypeScript Testing (Vitest + Testing Library)

**Component Test:**
```tsx
// Editor.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Editor } from './Editor'

describe('Editor', () => {
  it('renders editor with note content', () => {
    render(<Editor noteId="123" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onSave when save button clicked', async () => {
    const onSave = vi.fn()
    render(<Editor noteId="123" onSave={onSave} />)

    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalled()
  })
})
```

---

## Documentation Standards

### Code Documentation

**Go Package Documentation:**
```go
// Package database provides SQLite operations for notes and workspaces.
//
// The database uses WAL mode for concurrent reads and soft-delete pattern
// for trash recovery. All IDs are UUIDs for distributed sync support.
package database
```

**Function Documentation:**
```go
// CreateNote inserts a new note into the database with auto-generated UUID.
//
// Parameters:
//   - workspaceID: The workspace containing the note
//   - title: The note title (can be empty)
//   - content: The note content in markdown
//   - parentID: Optional parent note for nested hierarchy
//
// Returns the created note or error if workspace doesn't exist.
func CreateNote(workspaceID, title, content string, parentID *string) (*models.Note, error)
```

**TypeScript JSDoc:**
```tsx
/**
 * Auto-saves content after debounce delay
 * @param value - Content to save
 * @param onSave - Callback to persist changes
 * @param delay - Debounce delay in milliseconds (default: 2000)
 */
function useAutoSave(value: string, onSave: (value: string) => void, delay = 2000) {
  // ...
}
```

### README Requirements

Every package/module should have a README:
- Purpose and responsibilities
- Usage examples
- Dependencies
- Testing instructions

---

## Git Workflow

### Branch Naming

- Feature: `feature/editor-integration`
- Bug fix: `fix/sidebar-scroll-bug`
- Hotfix: `hotfix/crash-on-startup`
- Chore: `chore/update-dependencies`

### Commit Messages

Format: `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding missing tests
- `chore`: Updating build tasks, package manager configs, etc.

**Examples:**
```
feat(editor): integrate BlockNote with auto-save
fix(sidebar): prevent scroll jump when dragging notes
docs(readme): add installation instructions
refactor(database): extract query builders to helpers
test(notes): add integration tests for CRUD operations
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Code Review Checklist

### Reviewer Checklist

**Functionality:**
- [ ] Code does what PR description claims
- [ ] Edge cases handled (empty input, null, errors)
- [ ] No obvious bugs

**Code Quality:**
- [ ] Follows naming conventions
- [ ] No code duplication
- [ ] Functions are single-purpose
- [ ] Max function size respected (~50 lines Go, ~100 lines TS)

**Testing:**
- [ ] Tests added for new features
- [ ] Tests cover edge cases
- [ ] Tests pass locally

**Documentation:**
- [ ] Public functions have comments
- [ ] Complex logic explained
- [ ] README updated if needed

**Performance:**
- [ ] No unnecessary database queries
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Large lists virtualized if needed

**Security:**
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] User input validated

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA

---

## Appendix: Tools

### Linters & Formatters

**Go:**
- `gofmt` - Standard formatter
- `golangci-lint` - Meta-linter (includes gofmt, govet, staticcheck)

**TypeScript:**
- `prettier` - Code formatter
- `eslint` - Linter

**Run Before Commit:**
```bash
# Go
gofmt -w .
golangci-lint run

# TypeScript
npx prettier --write "src/**/*.{ts,tsx}"
npx eslint "src/**/*.{ts,tsx}"
```

### VS Code Extensions

- Go (golang.go)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Error Lens (usernamehw.errorlens)

### Settings

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[go]": {
    "editor.defaultFormatter": "golang.go"
  },
  "go.formatTool": "gofmt",
  "go.lintTool": "golangci-lint"
}
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Active
