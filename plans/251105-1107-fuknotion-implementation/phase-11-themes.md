# Phase 11: Theme System

**Phase:** 11/17 | **Duration:** 1 day | **Priority:** Low | **Status:** Pending

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

- [ ] Theme context
- [ ] System detection
- [ ] Switcher UI
- [ ] Persist preference
- [ ] CSS variables
- [ ] Component updates

## Success Criteria

- All themes work
- System theme auto-detects
- Preference persists
- No flash on load

## Next Steps

Phase 12: Google Drive Sync (Critical)
