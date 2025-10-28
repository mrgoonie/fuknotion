package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestNewDB(t *testing.T) {
	// Create temp directory
	tempDir := t.TempDir()

	// Initialize database
	db, err := NewDB(tempDir)
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	// Verify database file exists
	dbPath := filepath.Join(tempDir, "fuknotion.db")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Error("Database file was not created")
	}
}

func TestCreateAndGetWorkspace(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Create workspace
	ws, err := db.CreateWorkspace("Test Workspace")
	if err != nil {
		t.Fatalf("Failed to create workspace: %v", err)
	}

	if ws.Name != "Test Workspace" {
		t.Errorf("Expected name 'Test Workspace', got '%s'", ws.Name)
	}

	// Get workspace
	retrieved, err := db.GetWorkspace(ws.ID)
	if err != nil {
		t.Fatalf("Failed to get workspace: %v", err)
	}

	if retrieved.ID != ws.ID {
		t.Errorf("Expected ID %s, got %s", ws.ID, retrieved.ID)
	}
}

func TestCreateAndGetNote(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Create workspace first
	ws, _ := db.CreateWorkspace("Test Workspace")

	// Create note
	note, err := db.CreateNote(ws.ID, "Test Note", "# Test Content", nil)
	if err != nil {
		t.Fatalf("Failed to create note: %v", err)
	}

	if note.Title != "Test Note" {
		t.Errorf("Expected title 'Test Note', got '%s'", note.Title)
	}

	// Get note
	retrieved, err := db.GetNote(note.ID)
	if err != nil {
		t.Fatalf("Failed to get note: %v", err)
	}

	if retrieved.Content != "# Test Content" {
		t.Errorf("Expected content '# Test Content', got '%s'", retrieved.Content)
	}
}

func TestUpdateNote(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	ws, _ := db.CreateWorkspace("Test Workspace")
	note, _ := db.CreateNote(ws.ID, "Original", "Original content", nil)

	// Update note
	err := db.UpdateNote(note.ID, "Updated", "Updated content")
	if err != nil {
		t.Fatalf("Failed to update note: %v", err)
	}

	// Verify update
	updated, _ := db.GetNote(note.ID)
	if updated.Title != "Updated" {
		t.Errorf("Expected title 'Updated', got '%s'", updated.Title)
	}
	if updated.Content != "Updated content" {
		t.Errorf("Expected content 'Updated content', got '%s'", updated.Content)
	}
}

func TestDeleteNote(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	ws, _ := db.CreateWorkspace("Test Workspace")
	note, _ := db.CreateNote(ws.ID, "Test", "Content", nil)

	// Delete note
	err := db.DeleteNote(note.ID)
	if err != nil {
		t.Fatalf("Failed to delete note: %v", err)
	}

	// Verify note is marked deleted
	deleted, _ := db.GetNote(note.ID)
	if !deleted.IsDeleted {
		t.Error("Note should be marked as deleted")
	}
	if deleted.DeletedAt == nil {
		t.Error("DeletedAt should be set")
	}
}

func TestToggleFavorite(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	ws, _ := db.CreateWorkspace("Test Workspace")
	note, _ := db.CreateNote(ws.ID, "Test", "Content", nil)

	// Toggle favorite on
	db.ToggleFavorite(note.ID)
	toggled, _ := db.GetNote(note.ID)
	if !toggled.IsFavorite {
		t.Error("Note should be favorited")
	}

	// Toggle favorite off
	db.ToggleFavorite(note.ID)
	toggled, _ = db.GetNote(note.ID)
	if toggled.IsFavorite {
		t.Error("Note should not be favorited")
	}
}

func TestListNotes(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	ws, _ := db.CreateWorkspace("Test Workspace")

	// Create multiple notes
	db.CreateNote(ws.ID, "Note 1", "Content 1", nil)
	db.CreateNote(ws.ID, "Note 2", "Content 2", nil)
	deleted, _ := db.CreateNote(ws.ID, "Note 3", "Content 3", nil)
	db.DeleteNote(deleted.ID)

	// List notes
	notes, err := db.ListNotes(ws.ID)
	if err != nil {
		t.Fatalf("Failed to list notes: %v", err)
	}

	// Should only return non-deleted notes
	if len(notes) != 2 {
		t.Errorf("Expected 2 notes, got %d", len(notes))
	}
}

// Helper function to setup test database
func setupTestDB(t *testing.T) (*DB, func()) {
	tempDir := t.TempDir()
	db, err := NewDB(tempDir)
	if err != nil {
		t.Fatalf("Failed to create test database: %v", err)
	}

	cleanup := func() {
		db.Close()
	}

	return db, cleanup
}
