package app

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"fuknotion/backend/internal/config"
	"fuknotion/backend/internal/filesystem"
)

// App struct
type App struct {
	ctx    context.Context
	fs     *filesystem.FileSystem
	config *config.Config
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

	// Load configuration
	configPath := filepath.Join(appDataPath, "config.json")
	cfg, err := config.LoadConfig(configPath)
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		cfg = config.DefaultConfig()
	}
	a.config = cfg
}

// Shutdown is called at application termination
func (a *App) Shutdown(ctx context.Context) {
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
