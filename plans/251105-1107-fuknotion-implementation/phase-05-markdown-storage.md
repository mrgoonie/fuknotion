# Phase 05: Markdown File Storage with Metadata

**Phase:** 05/17 | **Duration:** 2 days | **Priority:** Critical | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 04 | **Next:** Phase 06
**Research:** `../reports/251105-researcher-markdown-to-planner.md`

## Overview

Implement markdown file storage with YAML frontmatter, parse/serialize functions, integrate with SQLite metadata.

## Key Insights

- YAML frontmatter = standard metadata format
- Flat file structure simpler than nested
- SQLite stores metadata, .md stores content
- BlockNote converts to/from markdown
- Three-way merge for conflict resolution

## Requirements

**Functional:**
- Notes saved as {id}.md with YAML frontmatter
- Parser extracts metadata + content
- Serializer combines them back
- File operations async

**Non-Functional:**
- Parse/serialize under 10ms per note
- Support notes up to 1MB (typical: 10KB)

## Architecture

```go
// backend/internal/note/parser.go
type Note struct {
    ID         string
    Title      string
    Created    time.Time
    Modified   time.Time
    FolderID   string
    IsFavorite bool
    Tags       []string
    Content    string
}

func ParseMarkdown(raw string) (*Note, error)
func SerializeNote(note *Note) string
```

```yaml
---
id: note_abc123
title: My Note
created: 2025-01-15T10:30:00Z
modified: 2025-01-15T14:20:00Z
folder_id: folder_work
is_favorite: false
tags: [work, important]
---
# My Note

Content here...
```

## Related Files

**Create:**
- `backend/internal/note/parser.go`
- `backend/internal/note/serializer.go`
- `backend/internal/note/service.go`
- `frontend/src/services/noteService.ts`

## Implementation Steps

1. **Install YAML Parser** - Go yaml.v3
2. **Implement Parser** - Split frontmatter/content
3. **Implement Serializer** - Combine to markdown
4. **File Storage** - Save to ~/.fuknotion/workspaces/{ws}/notes/
5. **CRUD Service** - Create, read, update, delete notes
6. **Validation** - Frontmatter schema validation
7. **Error Handling** - Invalid YAML, missing fields
8. **Tests** - Parse/serialize round-trip

## Todo List

- [ ] Install gopkg.in/yaml.v3
- [ ] Implement markdown parser
- [ ] Implement serializer
- [ ] Create note service (CRUD)
- [ ] File path handling (cross-platform)
- [ ] Validation logic
- [ ] Unit tests (parse/serialize)
- [ ] Integration tests (file I/O)
- [ ] Error handling
- [ ] Performance testing (1000 notes)

## Success Criteria

- Note saved as .md with frontmatter
- Parser extracts all metadata
- Serializer creates valid markdown
- Round-trip preserves data
- Files readable by other apps (Obsidian)

## Risk Assessment

**Risk:** YAML parsing errors on invalid input
**Mitigation:** Validation, graceful error handling

**Risk:** File encoding issues
**Mitigation:** Always use UTF-8, normalize line endings

## Security

- Validate file paths (no directory traversal)
- Sanitize frontmatter values
- Limit file size to prevent DoS

## Next Steps

Phase 06: Block-Based Text Editor Implementation
