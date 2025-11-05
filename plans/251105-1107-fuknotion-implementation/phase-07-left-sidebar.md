# Phase 07: Left Sidebar (Navigation, Folders, Notes)

**Phase:** 07/17 | **Duration:** 3 days | **Priority:** High | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 06 | **Next:** Phase 08

## Overview

Implement left sidebar with search box, action buttons, favorites, folders with drag-drop, settings, trash.

## Requirements

**Functional:**
- Search box (Ctrl/Cmd+K)
- New note button
- Favorites section
- Folders with expand/collapse
- Drag-drop to reorder/nest
- Settings link
- Trash link

## Architecture

```tsx
// LeftSidebar.tsx
<Sidebar>
  <SearchBox />
  <NewNoteButton />
  <FavoritesSection />
  <FoldersTree />
  <SettingsButton />
  <TrashButton />
</Sidebar>
```

## Related Files

**Create:**
- `frontend/src/components/Sidebar/LeftSidebar.tsx`
- `frontend/src/components/Sidebar/SearchBox.tsx`
- `frontend/src/components/Sidebar/FoldersTree.tsx`
- `frontend/src/components/Sidebar/NoteItem.tsx`
- `frontend/src/hooks/useDragDrop.ts`

## Implementation Steps

1. Sidebar layout (collapsible)
2. Search box with hotkey
3. New note action
4. Favorites list
5. Folder tree (recursive)
6. Drag-drop reorder
7. Settings/trash links

## Todo List

- [ ] Sidebar component
- [ ] Search box with Cmd+K
- [ ] Favorites section
- [ ] Folder tree (recursive)
- [ ] Drag-drop implementation
- [ ] Context menus
- [ ] Settings link
- [ ] Trash link

## Success Criteria

- Sidebar renders all sections
- Drag-drop works smoothly
- Search hotkey triggers
- Folders expand/collapse

## Next Steps

Phase 08: Right Sidebar (Metadata, TOC)
