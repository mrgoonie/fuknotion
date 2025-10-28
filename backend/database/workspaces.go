package database

import (
	"fmt"
	"time"

	"fuknotion/backend/models"
	"github.com/google/uuid"
)

// CreateWorkspace creates a new workspace
func (db *DB) CreateWorkspace(name string) (*models.Workspace, error) {
	workspace := &models.Workspace{
		ID:        uuid.New().String(),
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	query := `
		INSERT INTO workspaces (id, name, created_at, updated_at)
		VALUES (?, ?, ?, ?)
	`

	_, err := db.conn.Exec(query, workspace.ID, workspace.Name, workspace.CreatedAt, workspace.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace: %w", err)
	}

	return workspace, nil
}

// GetWorkspace retrieves a workspace by ID
func (db *DB) GetWorkspace(id string) (*models.Workspace, error) {
	workspace := &models.Workspace{}
	query := `
		SELECT id, name, created_at, updated_at
		FROM workspaces
		WHERE id = ?
	`

	err := db.conn.QueryRow(query, id).Scan(&workspace.ID, &workspace.Name, &workspace.CreatedAt, &workspace.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to get workspace: %w", err)
	}

	return workspace, nil
}

// ListWorkspaces retrieves all workspaces
func (db *DB) ListWorkspaces() ([]*models.Workspace, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM workspaces
		ORDER BY updated_at DESC
	`

	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list workspaces: %w", err)
	}
	defer rows.Close()

	var workspaces []*models.Workspace
	for rows.Next() {
		workspace := &models.Workspace{}
		err := rows.Scan(&workspace.ID, &workspace.Name, &workspace.CreatedAt, &workspace.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan workspace: %w", err)
		}
		workspaces = append(workspaces, workspace)
	}

	return workspaces, nil
}
