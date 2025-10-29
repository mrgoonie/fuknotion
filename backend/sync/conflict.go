package sync

import (
	"fmt"
	"fuknotion/backend/models"
)

// ConflictResolutionStrategy defines how conflicts are resolved
type ConflictResolutionStrategy string

const (
	// StrategyLocalWins prefers local changes
	StrategyLocalWins ConflictResolutionStrategy = "local_wins"
	// StrategyRemoteWins prefers remote changes
	StrategyRemoteWins ConflictResolutionStrategy = "remote_wins"
	// StrategyNewerWins prefers the most recent changes
	StrategyNewerWins ConflictResolutionStrategy = "newer_wins"
	// StrategyThreeWayMerge attempts to merge both changes
	StrategyThreeWayMerge ConflictResolutionStrategy = "three_way_merge"
)

// ConflictResolver handles conflict resolution between local and remote versions
type ConflictResolver struct {
	strategy ConflictResolutionStrategy
}

// NewConflictResolver creates a new conflict resolver
func NewConflictResolver(strategy ConflictResolutionStrategy) *ConflictResolver {
	return &ConflictResolver{
		strategy: strategy,
	}
}

// Resolve resolves a conflict between local and remote notes
func (cr *ConflictResolver) Resolve(local *models.Note, remote *models.Note, base *models.Note) (*models.Note, error) {
	switch cr.strategy {
	case StrategyLocalWins:
		return local, nil

	case StrategyRemoteWins:
		return remote, nil

	case StrategyNewerWins:
		return cr.resolveNewerWins(local, remote)

	case StrategyThreeWayMerge:
		return cr.resolveThreeWayMerge(local, remote, base)

	default:
		return nil, fmt.Errorf("unknown strategy: %s", cr.strategy)
	}
}

// resolveNewerWins returns the note with the most recent update
func (cr *ConflictResolver) resolveNewerWins(local *models.Note, remote *models.Note) (*models.Note, error) {
	if local.UpdatedAt.After(remote.UpdatedAt) {
		return local, nil
	}

	return remote, nil
}

// resolveThreeWayMerge attempts to merge local and remote changes using a base version
func (cr *ConflictResolver) resolveThreeWayMerge(local *models.Note, remote *models.Note, base *models.Note) (*models.Note, error) {
	// Three-way merge algorithm:
	// 1. If local == base, use remote (only remote changed)
	// 2. If remote == base, use local (only local changed)
	// 3. If local == remote, no conflict (both same)
	// 4. If both changed differently, prefer newer or mark as conflict

	if base == nil {
		// No base version, fall back to newer wins
		return cr.resolveNewerWins(local, remote)
	}

	localChanged := local.Content != base.Content || local.Title != base.Title
	remoteChanged := remote.Content != base.Content || remote.Title != base.Title

	// Case 1: Only remote changed
	if !localChanged && remoteChanged {
		return remote, nil
	}

	// Case 2: Only local changed
	if localChanged && !remoteChanged {
		return local, nil
	}

	// Case 3: Both same (or both unchanged)
	if local.Content == remote.Content && local.Title == remote.Title {
		return local, nil
	}

	// Case 4: Both changed - attempt smart merge
	merged := &models.Note{
		ID:          local.ID,
		WorkspaceID: local.WorkspaceID,
		ParentID:    local.ParentID,
		IsFavorite:  local.IsFavorite || remote.IsFavorite, // Preserve favorite if either marked
		IsDeleted:   local.IsDeleted || remote.IsDeleted,   // Preserve delete if either deleted
		CreatedAt:   local.CreatedAt,
	}

	// Merge title - prefer non-"Untitled" if one exists
	if local.Title != base.Title && local.Title != "" {
		merged.Title = local.Title
	} else {
		merged.Title = remote.Title
	}

	// Merge content - prefer longer content (assumes more work done)
	if len(local.Content) >= len(remote.Content) {
		merged.Content = local.Content
		merged.UpdatedAt = local.UpdatedAt
	} else {
		merged.Content = remote.Content
		merged.UpdatedAt = remote.UpdatedAt
	}

	// Preserve DeletedAt if present
	if local.DeletedAt != nil {
		merged.DeletedAt = local.DeletedAt
	} else if remote.DeletedAt != nil {
		merged.DeletedAt = remote.DeletedAt
	}

	return merged, nil
}

// DetectConflict checks if there's a conflict between local and remote versions
func (cr *ConflictResolver) DetectConflict(local *models.Note, remote *models.Note, base *models.Note) bool {
	if base == nil {
		// No base, check if local and remote differ
		return local.Content != remote.Content || local.Title != remote.Title
	}

	localChanged := local.Content != base.Content || local.Title != base.Title
	remoteChanged := remote.Content != base.Content || remote.Title != base.Title

	// Conflict exists if both changed and they're different
	return localChanged && remoteChanged &&
		(local.Content != remote.Content || local.Title != remote.Title)
}
