# Phase 13: Sharing System

**Phase:** 13/17 | **Duration:** 2 days | **Priority:** Medium | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 12 | **Next:** Phase 14

## Overview

Share notes via private (Drive permissions) or public links (read-only HTML).

## Requirements

- Share note via Drive link (private)
- Generate public HTML (read-only)
- Copy link to clipboard
- Revoke access

## Related Files

**Create:**
- `backend/internal/share/service.go`
- `frontend/src/components/Share/ShareDialog.tsx`

## Implementation Steps

1. Private share via Drive permissions
2. Public share as HTML export
3. Share dialog UI
4. Copy to clipboard
5. Revoke access

## Todo List

- [ ] Private share (Drive API)
- [ ] Public HTML export
- [ ] Share dialog
- [ ] Copy link
- [ ] Revoke share

## Success Criteria

- Private share works
- Public link viewable
- Revoke removes access

## Next Steps

Phase 14: Trash
