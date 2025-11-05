# Phase 14: Trash & Permanent Deletion

**Phase:** 14/17 | **Duration:** 1 day | **Priority:** Medium | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 13 | **Next:** Phase 15

## Overview

Soft delete to trash, auto-delete after 30 days, restore, permanent delete.

## Requirements

- Delete moves to trash
- Restore from trash
- Permanent delete
- Auto-delete after 30 days

## Architecture

```sql
ALTER TABLE notes ADD COLUMN deleted_at INTEGER;
```

## Related Files

**Create:**
- `backend/internal/note/trash.go`
- `frontend/src/components/Trash/TrashView.tsx`

## Implementation Steps

1. Add deleted_at column
2. Soft delete logic
3. Trash view UI
4. Restore function
5. Permanent delete
6. Auto-delete cron

## Todo List

- [ ] Schema update
- [ ] Soft delete
- [ ] Trash view
- [ ] Restore
- [ ] Permanent delete
- [ ] Auto-delete

## Success Criteria

- Delete to trash works
- Restore works
- Auto-delete runs

## Next Steps

Phase 15: Onboarding
