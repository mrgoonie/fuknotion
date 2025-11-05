# Phase 16: Testing & Optimization

**Phase:** 16/17 | **Duration:** 3 days | **Priority:** High | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 15 | **Next:** Phase 17

## Overview

Comprehensive testing, performance optimization, bug fixes, cross-platform validation.

## Requirements

**Functional:**
- Unit tests (70%+ coverage)
- Integration tests
- E2E tests
- Performance profiling

**Non-Functional:**
- App launch under 2s
- Note open under 200ms
- Sync under 30s (100 notes)
- Memory under 200MB

## Testing Strategy

**Unit Tests:** Go (`go test`), React (Jest)
**Integration Tests:** DB, File I/O, Sync
**E2E Tests:** Full user flows
**Performance Tests:** Load time, render time

## Related Files

**Create:**
- `backend/internal/*_test.go`
- `frontend/src/**/*.test.tsx`
- `tests/e2e/`

## Implementation Steps

1. Unit tests
2. Integration tests
3. E2E suite
4. Performance profiling
5. Optimize bottlenecks
6. Fix memory leaks
7. Cross-platform testing

## Todo List

- [ ] Unit tests (Go)
- [ ] Unit tests (React)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance profiling
- [ ] Optimize
- [ ] Memory profiling
- [ ] Test Win/Mac/Linux

## Success Criteria

- 70%+ coverage
- All tests pass
- No memory leaks
- Performance targets met

## Next Steps

Phase 17: Distribution
