# Phase 08: Right Sidebar (Metadata, TOC)

**Phase:** 08/17 | **Duration:** 2 days | **Priority:** Medium | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 07 | **Next:** Phase 09

## Overview

Right sidebar (collapsed by default) with note metadata, table of contents from headings.

## Requirements

**Functional:**
- Toggle visibility
- Note metadata (created, modified, word count)
- TOC generated from headings
- Click heading → scroll to section

## Architecture

```tsx
<RightSidebar>
  <MetadataPanel />
  <TOCPanel />
</RightSidebar>
```

## Related Files

**Create:**
- `frontend/src/components/Sidebar/RightSidebar.tsx`
- `frontend/src/components/Sidebar/MetadataPanel.tsx`
- `frontend/src/components/Sidebar/TOCPanel.tsx`

## Implementation Steps

1. Collapsible sidebar
2. Metadata display
3. Extract headings from editor
4. Generate TOC
5. Click to scroll

## Todo List

- [x] Right sidebar component
- [x] Metadata panel
- [x] TOC generation
- [ ] Scroll to heading (deferred - requires editor ref)
- [x] Toggle visibility

## Implementation Status

**Status:** Complete with issues
**Date:** 2025-11-05
**Review:** See `reports/251105-code-reviewer-phase08-report.md`

### Completed
- Right sidebar with collapse/expand (default collapsed)
- Metadata panel showing created/modified dates, word count, folder, favorite
- TOC panel with heading extraction and active tracking
- Layout integration with left sidebar

### Issues Found (3 High, 3 Medium, 2 Low)
**High Priority:**
1. Date parsing needs validation (`isNaN(date.getTime())`)
2. Word count includes markdown syntax (needs stripping)
3. Heading regex missing edge cases (no space, trailing hashes, code blocks)

**Medium Priority:**
4. Folder shows ID instead of name
5. Console.log in production code (TOCPanel.tsx:42)
6. React key using redundant index

**Recommended:** Apply fixes before commit

### Deferred Features
- Scroll-to-heading functionality (requires editor ref integration)
- Character count (only word count implemented)
- Reading time estimate
- Version history
- Share button

## Success Criteria

- [x] Sidebar collapses/expands
- [~] Metadata accurate (issues with date validation, word count)
- [x] TOC updates on edit (via useMemo)
- [ ] Click scrolls correctly (deferred)

## Next Steps

1. Apply high-priority fixes (date, word count, heading regex)
2. Remove console.log and fix React key
3. Test edge cases (invalid dates, markdown syntax, code blocks)
4. Commit Phase 08 implementation
5. Proceed to Phase 09: Tab Management
