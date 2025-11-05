# Phase 09: Tab Management

**Phase:** 09/17 | **Duration:** 2 days | **Priority:** Medium | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 08 | **Next:** Phase 10

## Overview

Tab system for multiple open notes, drag-drop reorder, close tabs.

## Requirements

**Functional:**
- Open notes in tabs
- Switch between tabs
- Close tabs (Cmd+W)
- Drag to reorder
- Middle-click to close

## Architecture

```tsx
<TabBar>
  {openNotes.map(note => 
    <Tab key={note.id} />
  )}
</TabBar>
```

## Related Files

**Create:**
- `frontend/src/components/Tabs/TabBar.tsx`
- `frontend/src/components/Tabs/Tab.tsx`
- `frontend/src/hooks/useTabs.ts`

## Implementation Steps

1. Tab bar component
2. Open note in tab
3. Switch active tab
4. Close tab logic
5. Drag-drop reorder
6. Keyboard shortcuts

## Todo List

- [ ] Tab bar UI
- [ ] Open/close logic
- [ ] Switch tabs
- [ ] Drag-drop reorder
- [ ] Keyboard shortcuts
- [ ] Unsaved changes warning

## Success Criteria

- Multiple notes open
- Tabs reorderable
- Shortcuts work (Cmd+W)
- Unsaved changes prompt

## Next Steps

Phase 10: Search Functionality
