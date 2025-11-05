# Phase 06: Block-Based Text Editor Implementation

**Phase:** 06/17 | **Duration:** 5 days | **Priority:** Critical | **Status:** BLOCKED - FIXES REQUIRED
**Review Date:** 2025-11-05 | **Review Report:** `./reports/251105-code-reviewer-phase06-report.md`

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 05 | **Next:** Phase 07
**Research:** `../reports/251105-researcher-editors-to-planner.md`

## Overview

Integrate BlockNote editor with Notion-like features, custom blocks, markdown conversion, offline support.

## Key Insights

- BlockNote provides blocks, slash commands, drag-drop out-of-box
- Built on ProseMirror (battle-tested)
- Markdown import/export built-in
- Extensible via custom blocks
- Perfect for offline (stores as JSON, converts to markdown)

## Requirements

**Functional:**
- Block-based editing (headings, paragraphs, lists, code, etc)
- Slash commands (/)
- Inline toolbar (select text → format)
- Drag-drop blocks
- Markdown shortcuts
- Custom blocks (callouts with emoji, internal links)
- Auto-save (debounced 2s)

**Non-Functional:**
- Render 1000 blocks under 100ms
- Editor loads under 500ms
- No typing lag (60fps)

## Architecture

```tsx
// frontend/src/components/Editor/BlockNoteEditor.tsx
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";

const Editor = ({ noteId }) => {
  const editor = useBlockNote({
    initialContent: loadedBlocks,
    onUpdate: debounce(handleSave, 2000),
  });

  return <BlockNoteView editor={editor} />;
};
```

## Related Files

**Create:**
- `frontend/src/components/Editor/BlockNoteEditor.tsx`
- `frontend/src/components/Editor/CustomBlocks/Callout.tsx`
- `frontend/src/components/Editor/CustomBlocks/InternalLink.tsx`
- `frontend/src/components/Editor/InlineToolbar.tsx`
- `frontend/src/components/Editor/SlashMenu.tsx`
- `frontend/src/hooks/useAutoSave.ts`
- `frontend/src/utils/blockNoteMarkdown.ts`

## Implementation Steps

1. **Install BlockNote** - @blocknote/core, @blocknote/react
2. **Basic Editor** - Initialize with default blocks
3. **Markdown Conversion** - Load from .md, save to .md
4. **Auto-Save** - Debounced 2s after last edit
5. **Inline Toolbar** - Format selected text
6. **Slash Commands** - Customize menu items
7. **Custom Callout Block** - With emoji picker
8. **Internal Links** - # trigger, note picker
9. **Drag-Drop** - Reorder blocks
10. **Keyboard Shortcuts** - Bold (Cmd+B), etc
11. **Theme Integration** - Light/dark mode

## Todo List

**Completed:**
- [x] Install BlockNote packages ✅
- [x] Create BlockNoteEditor component ✅
- [x] Markdown to BlockNote conversion ✅
- [x] BlockNote to Markdown conversion ✅
- [x] Auto-save implementation ✅ (NEEDS FIXES - see review)
- [x] Keyboard shortcuts ✅ (BlockNote defaults)

**Deferred to Phase 07:**
- [ ] Custom callout block (deferred)
- [ ] Internal link block (# trigger) (deferred)

**Deferred to Phase 11:**
- [ ] Theme styling (deferred)

**Deferred to Phase 16:**
- [ ] Performance testing (1000+ blocks) (deferred)

**Not Implemented (using BlockNote defaults):**
- [ ] Inline toolbar customization (default sufficient)
- [ ] Slash menu customization (default sufficient)

**CRITICAL FIXES REQUIRED (see review report):**
1. BlockNote package version mismatch (BLOCKING)
2. Auto-save race condition in cleanup
3. Unsafe type assertion (editor as any)

**HIGH PRIORITY FIXES:**
4. Add editor error boundary
5. Fix note loading race condition
6. Stabilize onSave callback
7. Add input validation in Go CreateNote

**Completion:** 5/12 original tasks (42%) | Core features functional

## Success Criteria

- Editor renders smoothly
- All markdown syntax supported
- Slash commands work
- Inline toolbar appears on selection
- Auto-save without user action
- Custom blocks (callouts, links) work
- No typing lag

## Risk Assessment

**Risk:** BlockNote bundle size too large
**Mitigation:** Code splitting, lazy load editor

**Risk:** Markdown conversion data loss
**Mitigation:** Round-trip tests, fallback to JSON storage

## Security

- Sanitize pasted content (XSS prevention)
- Validate internal link targets

## Next Steps

Phase 07: Left Sidebar (Navigation, Folders, Notes)
