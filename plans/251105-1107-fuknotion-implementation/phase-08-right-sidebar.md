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

- [ ] Right sidebar component
- [ ] Metadata panel
- [ ] TOC generation
- [ ] Scroll to heading
- [ ] Toggle visibility

## Success Criteria

- Sidebar collapses/expands
- Metadata accurate
- TOC updates on edit
- Click scrolls correctly

## Next Steps

Phase 09: Tab Management
