package filesystem

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// FileSystem handles all file operations for Fuknotion
type FileSystem struct {
	basePath string
}

// NewFileSystem creates a new file system service
func NewFileSystem(basePath string) (*FileSystem, error) {
	// Ensure base path exists
	if err := os.MkdirAll(basePath, 0700); err != nil {
		return nil, fmt.Errorf("failed to create base path: %w", err)
	}

	return &FileSystem{basePath: basePath}, nil
}

// validatePath ensures the path is safe and within basePath
func (fs *FileSystem) validatePath(path string) error {
	// Clean the path
	cleanPath := filepath.Clean(path)

	// Resolve full path
	fullPath := filepath.Join(fs.basePath, cleanPath)

	// Convert to absolute path
	absFullPath, err := filepath.Abs(fullPath)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	// Convert basePath to absolute
	absBasePath, err := filepath.Abs(fs.basePath)
	if err != nil {
		return fmt.Errorf("invalid base path: %w", err)
	}

	// Ensure the resolved path is within basePath
	if !strings.HasPrefix(absFullPath, absBasePath+string(filepath.Separator)) &&
		absFullPath != absBasePath {
		return fmt.Errorf("invalid path: access outside base directory not allowed")
	}

	return nil
}

// ResolvePath returns the full path within the base directory
func (fs *FileSystem) ResolvePath(relativePath string) (string, error) {
	if err := fs.validatePath(relativePath); err != nil {
		return "", err
	}

	fullPath := filepath.Join(fs.basePath, relativePath)
	return fullPath, nil
}

// ReadFile reads a file and returns its content
func (fs *FileSystem) ReadFile(relativePath string) ([]byte, error) {
	fullPath, err := fs.ResolvePath(relativePath)
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(fullPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	return data, nil
}

// WriteFile writes data to a file
func (fs *FileSystem) WriteFile(relativePath string, data []byte) error {
	fullPath, err := fs.ResolvePath(relativePath)
	if err != nil {
		return err
	}

	// Ensure directory exists
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	if err := os.WriteFile(fullPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// DeleteFile deletes a file
func (fs *FileSystem) DeleteFile(relativePath string) error {
	fullPath, err := fs.ResolvePath(relativePath)
	if err != nil {
		return err
	}

	if err := os.Remove(fullPath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// ListFiles lists all files in a directory
func (fs *FileSystem) ListFiles(relativePath string) ([]string, error) {
	fullPath, err := fs.ResolvePath(relativePath)
	if err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	var files []string
	for _, entry := range entries {
		if !entry.IsDir() {
			files = append(files, entry.Name())
		}
	}

	return files, nil
}

// FileExists checks if a file exists
func (fs *FileSystem) FileExists(relativePath string) bool {
	fullPath, err := fs.ResolvePath(relativePath)
	if err != nil {
		return false
	}

	_, err = os.Stat(fullPath)
	return err == nil
}
