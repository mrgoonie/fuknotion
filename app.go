package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"fuknotion/backend/database"
	"fuknotion/backend/models"
)

// App struct
type App struct {
	ctx context.Context
	db  *database.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Get user data directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("Error getting home directory:", err)
		return
	}

	dataDir := filepath.Join(homeDir, ".fuknotion")

	// Initialize database
	db, err := database.NewDB(dataDir)
	if err != nil {
		fmt.Println("Error initializing database:", err)
		return
	}

	a.db = db

	// Create default workspace if none exists
	workspaces, err := db.ListWorkspaces()
	if err == nil && len(workspaces) == 0 {
		_, err = db.CreateWorkspace("My Workspace")
		if err != nil {
			fmt.Println("Error creating default workspace:", err)
		}
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// Note operations exposed to frontend

// CreateNote creates a new note
func (a *App) CreateNote(workspaceID, title, content string, parentID *string) (*models.Note, error) {
	return a.db.CreateNote(workspaceID, title, content, parentID)
}

// GetNote retrieves a note by ID
func (a *App) GetNote(id string) (*models.Note, error) {
	return a.db.GetNote(id)
}

// ListNotes retrieves all notes for a workspace
func (a *App) ListNotes(workspaceID string) ([]*models.Note, error) {
	return a.db.ListNotes(workspaceID)
}

// UpdateNote updates a note
func (a *App) UpdateNote(id, title, content string) error {
	return a.db.UpdateNote(id, title, content)
}

// DeleteNote deletes a note
func (a *App) DeleteNote(id string) error {
	return a.db.DeleteNote(id)
}

// ToggleFavorite toggles favorite status
func (a *App) ToggleFavorite(id string) error {
	return a.db.ToggleFavorite(id)
}

// Workspace operations

// CreateWorkspace creates a new workspace
func (a *App) CreateWorkspace(name string) (*models.Workspace, error) {
	return a.db.CreateWorkspace(name)
}

// GetWorkspace retrieves a workspace
func (a *App) GetWorkspace(id string) (*models.Workspace, error) {
	return a.db.GetWorkspace(id)
}

// ListWorkspaces retrieves all workspaces
func (a *App) ListWorkspaces() ([]*models.Workspace, error) {
	return a.db.ListWorkspaces()
}
