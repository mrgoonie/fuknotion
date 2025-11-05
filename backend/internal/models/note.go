package models

import "time"

// Note represents a note entity
type Note struct {
	ID         string    `json:"id"`
	Title      string    `json:"title"`
	FolderID   string    `json:"folderId,omitempty"`
	FilePath   string    `json:"filePath"`
	IsFavorite bool      `json:"isFavorite"`
	Content    string    `json:"content"` // Markdown content
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// Workspace represents a workspace entity
type Workspace struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Path      string    `json:"path"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Folder represents a folder entity
type Folder struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	ParentID  string    `json:"parentId,omitempty"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"createdAt"`
}
