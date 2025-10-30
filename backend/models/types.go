package models

import "time"

// Note represents a markdown note
type Note struct {
	ID          string     `json:"id"`
	WorkspaceID string     `json:"workspaceId"`
	Title       string     `json:"title"`
	Content     string     `json:"content"`
	ParentID    *string    `json:"parentId,omitempty"` // For nested notes
	IsFavorite  bool       `json:"isFavorite"`
	IsDeleted   bool       `json:"isDeleted"`
	CreatedAt   time.Time  `json:"createdAt" ts_type:"string"`
	UpdatedAt   time.Time  `json:"updatedAt" ts_type:"string"`
	DeletedAt   *time.Time `json:"deletedAt,omitempty" ts_type:"string"`
}

// Workspace represents a workspace/vault
type Workspace struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt" ts_type:"string"`
	UpdatedAt time.Time `json:"updatedAt" ts_type:"string"`
}

// Member represents a workspace member
type Member struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspaceId"`
	Email       string    `json:"email"`
	Role        string    `json:"role"` // owner, editor, viewer
	CreatedAt   time.Time `json:"createdAt" ts_type:"string"`
}

// SyncStatus represents sync queue status
type SyncStatus struct {
	ID        string    `json:"id"`
	NoteID    string    `json:"noteId"`
	Status    string    `json:"status"` // pending, syncing, synced, error
	Error     *string   `json:"error,omitempty"`
	UpdatedAt time.Time `json:"updatedAt" ts_type:"string"`
}
