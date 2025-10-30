package database

import (
	"database/sql"
	"fmt"
	"time"

	"fuknotion/backend/models"
	"github.com/google/uuid"
)

// CreateNote creates a new note
func (db *DB) CreateNote(workspaceID, title, content string, parentID *string) (*models.Note, error) {
	note := &models.Note{
		ID:          uuid.New().String(),
		WorkspaceID: workspaceID,
		Title:       title,
		Content:     content,
		ParentID:    parentID,
		IsFavorite:  false,
		IsDeleted:   false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO notes (id, workspace_id, title, content, parent_id, is_favorite, is_deleted, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := db.conn.Exec(query, note.ID, note.WorkspaceID, note.Title, note.Content, note.ParentID, note.IsFavorite, note.IsDeleted, note.CreatedAt, note.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create note: %w", err)
	}

	return note, nil
}

// GetNote retrieves a note by ID
func (db *DB) GetNote(id string) (*models.Note, error) {
	note := &models.Note{}
	query := `
		SELECT id, workspace_id, title, content, parent_id, is_favorite, is_deleted, created_at, updated_at, deleted_at
		FROM notes
		WHERE id = ?
	`

	err := db.conn.QueryRow(query, id).Scan(
		&note.ID, &note.WorkspaceID, &note.Title, &note.Content, &note.ParentID,
		&note.IsFavorite, &note.IsDeleted, &note.CreatedAt, &note.UpdatedAt, &note.DeletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("note not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get note: %w", err)
	}

	return note, nil
}

// ListNotes retrieves all non-deleted notes for a workspace
func (db *DB) ListNotes(workspaceID string) ([]*models.Note, error) {
	query := `
		SELECT id, workspace_id, title, content, parent_id, is_favorite, is_deleted, created_at, updated_at, deleted_at
		FROM notes
		WHERE workspace_id = ? AND is_deleted = 0
		ORDER BY updated_at DESC
	`

	rows, err := db.conn.Query(query, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to list notes: %w", err)
	}
	defer rows.Close()

	notes := make([]*models.Note, 0)
	for rows.Next() {
		note := &models.Note{}
		err := rows.Scan(
			&note.ID, &note.WorkspaceID, &note.Title, &note.Content, &note.ParentID,
			&note.IsFavorite, &note.IsDeleted, &note.CreatedAt, &note.UpdatedAt, &note.DeletedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		notes = append(notes, note)
	}

	return notes, nil
}

// UpdateNote updates a note's title and content
func (db *DB) UpdateNote(id, title, content string) error {
	query := `
		UPDATE notes
		SET title = ?, content = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := db.conn.Exec(query, title, content, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update note: %w", err)
	}

	return nil
}

// DeleteNote marks a note as deleted (soft delete)
func (db *DB) DeleteNote(id string) error {
	query := `
		UPDATE notes
		SET is_deleted = 1, deleted_at = ?, updated_at = ?
		WHERE id = ?
	`

	now := time.Now()
	_, err := db.conn.Exec(query, now, now, id)
	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}

	return nil
}

// ToggleFavorite toggles the favorite status of a note
func (db *DB) ToggleFavorite(id string) error {
	query := `
		UPDATE notes
		SET is_favorite = NOT is_favorite, updated_at = ?
		WHERE id = ?
	`

	_, err := db.conn.Exec(query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to toggle favorite: %w", err)
	}

	return nil
}
