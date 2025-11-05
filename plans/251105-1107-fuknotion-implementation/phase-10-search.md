# Phase 10: Search Functionality

**Phase:** 10/17 | **Duration:** 3 days | **Priority:** High | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 09 | **Next:** Phase 11

## Overview

Full-text search using SQLite FTS5, spotlight UI (Ctrl+K), search results with preview.

## Requirements

**Functional:**
- Search all notes (title + content)
- Spotlight UI (center screen)
- Results with preview snippets
- Keyboard navigation
- Click to open note

**Non-Functional:**
- Search results under 100ms
- Highlight matched terms

## Architecture

```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
  note_id, title, content,
  tokenize='porter unicode61'
);
```

```tsx
<SearchSpotlight>
  <SearchInput />
  <SearchResults>
    {results.map(r => <ResultItem />)}
  </SearchResults>
</SearchSpotlight>
```

## Related Files

**Create:**
- `backend/internal/search/service.go`
- `frontend/src/components/Search/SearchSpotlight.tsx`
- `frontend/src/components/Search/ResultItem.tsx`
- `frontend/src/hooks/useSearch.ts`

## Implementation Steps

1. Create FTS5 table
2. Index notes on save
3. Search query function
4. Spotlight UI component
5. Keyboard navigation (arrows)
6. Highlight matches
7. Debounced search input

## Todo List

- [ ] FTS5 table setup
- [ ] Index notes
- [ ] Search service (Go)
- [ ] Spotlight UI
- [ ] Keyboard navigation
- [ ] Highlight matches
- [ ] Debounced input
- [ ] Performance testing

## Success Criteria

- Search finds relevant notes
- Results under 100ms
- Keyboard navigation smooth
- Matched terms highlighted

## Next Steps

Phase 11: Theme System
