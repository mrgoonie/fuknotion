package note

import (
	"fmt"
	"path/filepath"
	"time"

	"fuknotion/backend/internal/database"
	"fuknotion/backend/internal/filesystem"
	"fuknotion/backend/internal/models"

	"github.com/google/uuid"
)

// Service handles note operations
type Service struct {
	db *database.Database
	fs *filesystem.FileSystem
}

// NewService creates a new note service
func NewService(db *database.Database, fs *filesystem.FileSystem) *Service {
	return &Service{db: db, fs: fs}
}

// CreateNote creates a new note
func (s *Service) CreateNote(title, content, folderID string) (*models.Note, error) {
	id := uuid.New().String()
	now := time.Now()

	filePath := filepath.Join("notes", id+".md")

	// Create frontmatter
	fm := &Frontmatter{
		ID:         id,
		Title:      title,
		Created:    now,
		Modified:   now,
		FolderID:   folderID,
		IsFavorite: false,
	}

	// Serialize to markdown
	markdown, err := SerializeNote(fm, content)
	if err != nil {
		return nil, fmt.Errorf("failed to serialize note: %w", err)
	}

	// Save to file
	if err := s.fs.WriteFile(filePath, []byte(markdown)); err != nil {
		return nil, fmt.Errorf("failed to write note file: %w", err)
	}

	// Save metadata to database
	// Use NULL for empty folder_id to satisfy foreign key constraint
	var folderIDPtr *string
	if folderID != "" {
		folderIDPtr = &folderID
	}

	query := `
		INSERT INTO notes (id, title, folder_id, file_path, is_favorite, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	_, err = s.db.Exec(query, id, title, folderIDPtr, filePath, false, now, now)
	if err != nil {
		return nil, fmt.Errorf("failed to insert note: %w", err)
	}

	return &models.Note{
		ID:         id,
		Title:      title,
		FolderID:   folderID,
		FilePath:   filePath,
		IsFavorite: false,
		Content:    content,
		CreatedAt:  now,
		UpdatedAt:  now,
	}, nil
}

// GetNote retrieves a note by ID
func (s *Service) GetNote(id string) (*models.Note, error) {
	query := `
		SELECT id, title, folder_id, file_path, is_favorite, created_at, updated_at
		FROM notes WHERE id = ?
	`
	var note models.Note
	var folderID *string

	err := s.db.QueryRow(query, id).Scan(
		&note.ID,
		&note.Title,
		&folderID,
		&note.FilePath,
		&note.IsFavorite,
		&note.CreatedAt,
		&note.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get note: %w", err)
	}

	if folderID != nil {
		note.FolderID = *folderID
	}

	// Read file content
	data, err := s.fs.ReadFile(note.FilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read note file: %w", err)
	}

	// Parse markdown
	_, content, err := ParseMarkdown(string(data))
	if err != nil {
		// If parsing fails, use raw content
		note.Content = string(data)
	} else {
		note.Content = content
	}

	return &note, nil
}

// UpdateNote updates an existing note
func (s *Service) UpdateNote(id, title, content string) error {
	// Get existing note
	note, err := s.GetNote(id)
	if err != nil {
		return err
	}

	now := time.Now()

	// Update frontmatter
	fm := &Frontmatter{
		ID:         id,
		Title:      title,
		Created:    note.CreatedAt,
		Modified:   now,
		FolderID:   note.FolderID,
		IsFavorite: note.IsFavorite,
	}

	// Serialize to markdown
	markdown, err := SerializeNote(fm, content)
	if err != nil {
		return fmt.Errorf("failed to serialize note: %w", err)
	}

	// Save to file
	if err := s.fs.WriteFile(note.FilePath, []byte(markdown)); err != nil {
		return fmt.Errorf("failed to write note file: %w", err)
	}

	// Update metadata in database
	query := `UPDATE notes SET title = ?, updated_at = ? WHERE id = ?`
	_, err = s.db.Exec(query, title, now, id)
	if err != nil {
		return fmt.Errorf("failed to update note: %w", err)
	}

	return nil
}

// DeleteNote deletes a note
func (s *Service) DeleteNote(id string) error {
	// Get note to find file path
	note, err := s.GetNote(id)
	if err != nil {
		return err
	}

	// Delete file
	if err := s.fs.DeleteFile(note.FilePath); err != nil {
		return fmt.Errorf("failed to delete note file: %w", err)
	}

	// Delete from database
	query := `DELETE FROM notes WHERE id = ?`
	_, err = s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}

	return nil
}

// ListNotes lists all notes
func (s *Service) ListNotes() ([]*models.Note, error) {
	query := `
		SELECT id, title, folder_id, file_path, is_favorite, created_at, updated_at
		FROM notes ORDER BY updated_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list notes: %w", err)
	}
	defer rows.Close()

	var notes []*models.Note
	for rows.Next() {
		var note models.Note
		var folderID *string

		err := rows.Scan(
			&note.ID,
			&note.Title,
			&folderID,
			&note.FilePath,
			&note.IsFavorite,
			&note.CreatedAt,
			&note.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}

		if folderID != nil {
			note.FolderID = *folderID
		}

		notes = append(notes, &note)
	}

	return notes, nil
}
