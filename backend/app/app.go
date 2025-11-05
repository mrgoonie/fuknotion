package app

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"fuknotion/backend/internal/auth"
	"fuknotion/backend/internal/config"
	"fuknotion/backend/internal/database"
	"fuknotion/backend/internal/filesystem"
	"fuknotion/backend/internal/models"
	"fuknotion/backend/internal/note"

	"golang.org/x/oauth2"
)

// App struct
type App struct {
	ctx            context.Context
	fs             *filesystem.FileSystem
	config         *config.Config
	db             *database.Database
	userDB         *database.Database
	noteService    *note.Service
	oauthService   *auth.OAuthService
	storage        *auth.SecureStorage
	sessionManager *auth.SessionManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	// Validate context
	if ctx == nil {
		fmt.Println("Error: nil context provided to Startup")
		return
	}

	a.ctx = ctx

	// Initialize file system
	appDataPath := a.GetAppDataPath()
	fs, err := filesystem.NewFileSystem(appDataPath)
	if err != nil {
		fmt.Printf("Failed to initialize file system: %v\n", err)
		return
	}
	a.fs = fs

	// Initialize user database
	userDB, err := database.InitUserDB(appDataPath)
	if err != nil {
		fmt.Printf("Failed to initialize user database: %v\n", err)
		return
	}
	a.userDB = userDB

	// Initialize workspace database
	// For now, use a default workspace path. In Phase 07, we'll add workspace management
	workspacePath := filepath.Join(appDataPath, "workspaces", "default")
	db, err := database.InitWorkspaceDB(workspacePath)
	if err != nil {
		fmt.Printf("Failed to initialize database: %v\n", err)
		return
	}
	a.db = db

	// Initialize note service
	a.noteService = note.NewService(db, fs)

	// Load configuration
	configPath := filepath.Join(appDataPath, "config.json")
	cfg, err := config.LoadConfig(configPath)
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		cfg = config.DefaultConfig()
	}
	a.config = cfg

	// Initialize auth services
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	fmt.Printf("Loading OAuth credentials...\n")
	fmt.Printf("GOOGLE_CLIENT_ID present: %v\n", clientID != "")
	fmt.Printf("GOOGLE_CLIENT_SECRET present: %v\n", clientSecret != "")

	if clientID != "" && clientSecret != "" {
		a.oauthService = auth.NewOAuthService(clientID, clientSecret)

		storage, err := auth.NewSecureStorage("fuknotion")
		if err != nil {
			fmt.Printf("Failed to initialize secure storage: %v\n", err)
		} else {
			a.storage = storage
			a.sessionManager = auth.NewSessionManager(ctx, a.oauthService, storage)

			// Try to restore previous session
			err = a.sessionManager.RestoreSession(func(token *oauth2.Token) error {
				fmt.Println("Token refreshed automatically")
				return nil
			})
			if err == nil {
				fmt.Println("Previous session restored successfully")
			}
		}
	} else {
		fmt.Println("Warning: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set. Authentication will not be available.")
	}
}

// Shutdown is called at application termination
func (a *App) Shutdown(ctx context.Context) {
	// Stop session manager
	if a.sessionManager != nil {
		a.sessionManager.Stop()
	}

	// Close databases
	if a.db != nil {
		if err := a.db.Close(); err != nil {
			fmt.Printf("Failed to close workspace database: %v\n", err)
		}
	}

	if a.userDB != nil {
		if err := a.userDB.Close(); err != nil {
			fmt.Printf("Failed to close user database: %v\n", err)
		}
	}

	// Save configuration
	if a.config != nil {
		configPath := filepath.Join(a.GetAppDataPath(), "config.json")
		if err := config.SaveConfig(configPath, a.config); err != nil {
			fmt.Printf("Failed to save config: %v\n", err)
		}
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	if name == "" {
		return "Please enter your name to continue"
	}
	return "Hello " + name + ", welcome to Fuknotion!"
}

// GetAppDataPath returns the application data directory path
func (a *App) GetAppDataPath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ".fuknotion"
	}
	return filepath.Join(homeDir, ".fuknotion")
}

// ReadFile reads a file from the app data directory
func (a *App) ReadFile(relativePath string) (string, error) {
	if a.fs == nil {
		return "", fmt.Errorf("file system not initialized")
	}

	data, err := a.fs.ReadFile(relativePath)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

// WriteFile writes a file to the app data directory
func (a *App) WriteFile(relativePath string, content string) error {
	if a.fs == nil {
		return fmt.Errorf("file system not initialized")
	}

	return a.fs.WriteFile(relativePath, []byte(content))
}

// DeleteFile deletes a file from the app data directory
func (a *App) DeleteFile(relativePath string) error {
	if a.fs == nil {
		return fmt.Errorf("file system not initialized")
	}

	return a.fs.DeleteFile(relativePath)
}

// ListFiles lists files in a directory within app data
func (a *App) ListFiles(relativePath string) ([]string, error) {
	if a.fs == nil {
		return nil, fmt.Errorf("file system not initialized")
	}

	return a.fs.ListFiles(relativePath)
}

// FileExists checks if a file exists in the app data directory
func (a *App) FileExists(relativePath string) bool {
	if a.fs == nil {
		return false
	}

	return a.fs.FileExists(relativePath)
}

// GetConfig returns the current configuration
func (a *App) GetConfig() map[string]interface{} {
	if a.config == nil {
		return map[string]interface{}{}
	}

	return map[string]interface{}{
		"theme":            a.config.Theme,
		"autoSave":         a.config.AutoSave,
		"autoSaveInterval": a.config.AutoSaveInterval,
	}
}

// UpdateConfig updates the configuration
func (a *App) UpdateConfig(key string, value interface{}) error {
	if a.config == nil {
		return fmt.Errorf("config not initialized")
	}

	switch key {
	case "theme":
		if theme, ok := value.(string); ok {
			a.config.Theme = theme
		}
	case "autoSave":
		if autoSave, ok := value.(bool); ok {
			a.config.AutoSave = autoSave
		}
	case "autoSaveInterval":
		if interval, ok := value.(float64); ok {
			a.config.AutoSaveInterval = int(interval)
		}
	default:
		return fmt.Errorf("unknown config key: %s", key)
	}

	// Save immediately
	configPath := filepath.Join(a.GetAppDataPath(), "config.json")
	return config.SaveConfig(configPath, a.config)
}

// CreateNote creates a new note
func (a *App) CreateNote(title, content, folderID string) (*models.Note, error) {
	if a.noteService == nil {
		return nil, fmt.Errorf("note service not initialized")
	}
	return a.noteService.CreateNote(title, content, folderID)
}

// GetNote retrieves a note by ID
func (a *App) GetNote(id string) (*models.Note, error) {
	if a.noteService == nil {
		return nil, fmt.Errorf("note service not initialized")
	}
	return a.noteService.GetNote(id)
}

// UpdateNote updates an existing note
func (a *App) UpdateNote(id, title, content string) error {
	if a.noteService == nil {
		return fmt.Errorf("note service not initialized")
	}
	return a.noteService.UpdateNote(id, title, content)
}

// DeleteNote deletes a note
func (a *App) DeleteNote(id string) error {
	if a.noteService == nil {
		return fmt.Errorf("note service not initialized")
	}
	return a.noteService.DeleteNote(id)
}

// ListNotes lists all notes
func (a *App) ListNotes() ([]*models.Note, error) {
	if a.noteService == nil {
		return nil, fmt.Errorf("note service not initialized")
	}
	return a.noteService.ListNotes()
}

// SearchResult represents a search result for frontend
type SearchResult struct {
	Note    *models.Note `json:"note"`
	Snippet string       `json:"snippet"`
	Rank    float64      `json:"rank"`
}

// SearchNotes searches for notes using full-text search
func (a *App) SearchNotes(query string) ([]*SearchResult, error) {
	if a.noteService == nil {
		return nil, fmt.Errorf("note service not initialized")
	}

	results, err := a.noteService.SearchNotes(query)
	if err != nil {
		return nil, err
	}

	// Convert to app-level SearchResult
	appResults := make([]*SearchResult, len(results))
	for i, r := range results {
		appResults[i] = &SearchResult{
			Note:    r.Note,
			Snippet: r.Snippet,
			Rank:    r.Rank,
		}
	}

	return appResults, nil
}
