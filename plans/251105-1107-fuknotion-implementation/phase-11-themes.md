# Phase 11: Theme System

**Phase:** 11/17 | **Duration:** 1 day | **Priority:** Low | **Status:** IN PROGRESS (80% complete)

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 10 | **Next:** Phase 12

## Overview

Theme switcher (System, Light, Dark) with persistent preference.

## Requirements

**Functional:**
- Three themes: System, Light, Dark
- Auto-switch based on OS
- Persist user preference
- Apply to all components

## Architecture

```tsx
const themes = {
  light: { bg: '#fff', text: '#000' },
  dark: { bg: '#1a1a1a', text: '#fff' }
};
```

## Related Files

**Create:**
- `frontend/src/contexts/ThemeContext.tsx`
- `frontend/src/hooks/useTheme.ts`
- `frontend/src/styles/themes.ts`

## Implementation Steps

1. Theme context provider
2. Detect system theme
3. Theme switcher UI
4. Persist preference
5. Apply CSS variables
6. Update all components

## Todo List

- [x] Theme context ✅
- [x] System detection ✅
- [x] Switcher UI ✅
- [x] Persist preference ✅
- [x] CSS variables ✅
- [ ] Component updates ⚠️ IN PROGRESS
  - [x] 8 sidebar components (LeftSidebar, RightSidebar, SearchBox, FavoritesSection, FoldersTree, NoteItem, MetadataPanel, TOCPanel) ✅
  - [ ] Tab components (Tab.tsx, TabBar.tsx) - 6+ hardcoded classes ❌
  - [ ] Search components (SearchSpotlight.tsx, ResultItem.tsx) - 15+ hardcoded classes ❌
  - [ ] Views (EditorView.tsx, SettingsView.tsx) - 8+ hardcoded classes ❌
  - [ ] ErrorBoundary.tsx, router.tsx - 7+ hardcoded classes ❌

## Blockers (from Code Review 251105)

**CRITICAL:**
1. 13+ components with hardcoded gray-*/blue-* classes (prevents theme from working correctly)
2. Missing 'overlay' CSS variable in Tailwind config (SearchSpotlight can't use theme overlay)
3. localStorage not sanitized (XSS security risk)

**HIGH:**
4. ThemeSwitcher missing ARIA attributes (accessibility)
5. ThemeSwitcher missing focus indicators (accessibility)
6. "New Note" button uses hardcoded blue-600/blue-700

**Review Report:** `/plans/251105-1107-fuknotion-implementation/reports/251105-code-reviewer-phase11-theme-system-report.md`

## Success Criteria

- All themes work
- System theme auto-detects
- Preference persists
- No flash on load

## Next Steps

Phase 12: Google Drive Sync (Critical)
