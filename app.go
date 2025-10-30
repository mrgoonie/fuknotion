package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"fuknotion/backend/database"
	"fuknotion/backend/models"
	"fuknotion/backend/sync"
)

// App struct
type App struct {
	ctx       context.Context
	db        *database.DB
	driveSync *sync.DriveSync
	syncQueue *sync.SyncQueue
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

	// Initialize Google Drive sync
	driveSync, err := sync.NewDriveSync()
	if err != nil {
		fmt.Println("Error initializing Drive sync:", err)
	} else {
		a.driveSync = driveSync

		// Initialize sync queue if authenticated
		if driveSync.IsAuthenticated() {
			a.syncQueue = sync.NewSyncQueue(db, driveSync)
			go a.syncQueue.Start(ctx)
		}
	}

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

// Google Drive Sync operations

// GetDriveAuthURL returns the Google OAuth2 authorization URL
func (a *App) GetDriveAuthURL() (string, error) {
	if a.driveSync == nil {
		return "", fmt.Errorf("drive sync not initialized")
	}
	return a.driveSync.GetAuthURL(), nil
}

// AuthenticateDrive exchanges the authorization code for an access token
func (a *App) AuthenticateDrive(code string) error {
	if a.driveSync == nil {
		return fmt.Errorf("drive sync not initialized")
	}

	if err := a.driveSync.ExchangeCode(a.ctx, code); err != nil {
		return err
	}

	// Initialize sync queue after authentication
	a.syncQueue = sync.NewSyncQueue(a.db, a.driveSync)
	go a.syncQueue.Start(a.ctx)

	return nil
}

// IsDriveAuthenticated checks if user is authenticated with Google Drive
func (a *App) IsDriveAuthenticated() bool {
	if a.driveSync == nil {
		return false
	}
	return a.driveSync.IsAuthenticated()
}

// GetSyncStatus returns the current sync queue status
func (a *App) GetSyncStatus() map[string]interface{} {
	if a.syncQueue == nil {
		return map[string]interface{}{
			"queueLength":   0,
			"processing":    false,
			"authenticated": false,
		}
	}
	return a.syncQueue.GetQueueStatus()
}

// TriggerSync manually triggers a sync operation
func (a *App) TriggerSync() error {
	if a.syncQueue == nil {
		return fmt.Errorf("sync queue not initialized")
	}

	// Enqueue all unsynced notes
	workspaces, err := a.db.ListWorkspaces()
	if err != nil {
		return err
	}

	for _, workspace := range workspaces {
		notes, err := a.db.ListNotes(workspace.ID)
		if err != nil {
			continue
		}

		for _, note := range notes {
			if !note.IsDeleted {
				a.syncQueue.Enqueue(note.ID, sync.OperationUpdate, note)
			}
		}
	}

	return nil
}

// StartDriveAuth initiates Google Drive OAuth flow
// Opens system browser for authentication
func (a *App) StartDriveAuth() (string, error) {
	if a.driveSync == nil {
		return "", fmt.Errorf("drive sync not initialized")
	}

	authURL, err := a.driveSync.StartAuth()
	if err != nil {
		return "", fmt.Errorf("failed to start auth: %w", err)
	}

	// Start goroutine to wait for callback
	go func() {
		if err := a.driveSync.WaitForAuth(a.ctx); err != nil {
			fmt.Println("Auth error:", err)
			return
		}

		// Authentication successful, start sync queue
		if a.syncQueue == nil {
			a.syncQueue = sync.NewSyncQueue(a.db, a.driveSync)
			go a.syncQueue.Start(a.ctx)
		}
	}()

	return authURL, nil
}

// SignOutDrive signs out from Google Drive
func (a *App) SignOutDrive() error {
	if a.driveSync == nil {
		return fmt.Errorf("drive sync not initialized")
	}

	// Stop sync queue
	if a.syncQueue != nil {
		// Note: SyncQueue doesn't have Stop method yet
		a.syncQueue = nil
	}

	// Sign out and remove token
	if err := a.driveSync.SignOut(); err != nil {
		return fmt.Errorf("failed to sign out: %w", err)
	}

	return nil
}

// GetDriveAccountInfo returns authenticated user's account information
func (a *App) GetDriveAccountInfo() (map[string]interface{}, error) {
	if a.driveSync == nil {
		return nil, fmt.Errorf("drive sync not initialized")
	}

	if !a.driveSync.IsAuthenticated() {
		return map[string]interface{}{
			"authorized": false,
		}, nil
	}

	return a.driveSync.GetAccountInfo(a.ctx)
}
