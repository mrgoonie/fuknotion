package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestOpen(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test.db")

	db, err := Open(dbPath)
	if err != nil {
		t.Fatalf("Open() failed: %v", err)
	}
	defer db.Close()

	// Verify foreign keys are enabled
	var fkEnabled int
	err = db.QueryRow("PRAGMA foreign_keys").Scan(&fkEnabled)
	if err != nil {
		t.Fatalf("Failed to check foreign keys: %v", err)
	}
	if fkEnabled != 1 {
		t.Error("Foreign keys not enabled")
	}
}

func TestInitUserDB(t *testing.T) {
	tmpDir := t.TempDir()

	db, err := InitUserDB(tmpDir)
	if err != nil {
		t.Fatalf("InitUserDB() failed: %v", err)
	}
	defer db.Close()

	// Verify user.db file was created
	dbPath := filepath.Join(tmpDir, "user.db")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Error("user.db file was not created")
	}

	// Verify user table exists
	var tableName string
	err = db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").Scan(&tableName)
	if err != nil {
		t.Fatalf("Failed to find user table: %v", err)
	}
	if tableName != "user" {
		t.Errorf("Table name = %v, want user", tableName)
	}

	// Verify workspaces table exists
	err = db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='workspaces'").Scan(&tableName)
	if err != nil {
		t.Fatalf("Failed to find workspaces table: %v", err)
	}
	if tableName != "workspaces" {
		t.Errorf("Table name = %v, want workspaces", tableName)
	}
}

func TestInitWorkspaceDB(t *testing.T) {
	tmpDir := t.TempDir()

	db, err := InitWorkspaceDB(tmpDir)
	if err != nil {
		t.Fatalf("InitWorkspaceDB() failed: %v", err)
	}
	defer db.Close()

	// Verify workspace.db file was created
	dbPath := filepath.Join(tmpDir, "workspace.db")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Error("workspace.db file was not created")
	}

	// Verify all required tables exist
	tables := []string{"notes", "folders", "members"}
	for _, table := range tables {
		var tableName string
		query := "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
		err = db.QueryRow(query, table).Scan(&tableName)
		if err != nil {
			t.Errorf("Failed to find %s table: %v", table, err)
		}
	}

	// Verify indexes exist
	indexes := []string{
		"idx_notes_folder",
		"idx_notes_favorite",
		"idx_notes_updated",
		"idx_folders_parent",
		"idx_members_email",
	}
	for _, index := range indexes {
		var indexName string
		query := "SELECT name FROM sqlite_master WHERE type='index' AND name=?"
		err = db.QueryRow(query, index).Scan(&indexName)
		if err != nil {
			t.Errorf("Failed to find %s index: %v", index, err)
		}
	}
}

func TestDatabaseCRUD(t *testing.T) {
	tmpDir := t.TempDir()
	db, err := InitWorkspaceDB(tmpDir)
	if err != nil {
		t.Fatalf("InitWorkspaceDB() failed: %v", err)
	}
	defer db.Close()

	// Test INSERT
	query := `INSERT INTO notes (id, title, file_path, is_favorite) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, "note_1", "Test Note", "notes/note_1.md", false)
	if err != nil {
		t.Fatalf("Failed to insert note: %v", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		t.Fatalf("Failed to get rows affected: %v", err)
	}
	if affected != 1 {
		t.Errorf("RowsAffected = %d, want 1", affected)
	}

	// Test SELECT
	var id, title, filePath string
	var isFavorite bool
	query = `SELECT id, title, file_path, is_favorite FROM notes WHERE id = ?`
	err = db.QueryRow(query, "note_1").Scan(&id, &title, &filePath, &isFavorite)
	if err != nil {
		t.Fatalf("Failed to query note: %v", err)
	}

	if id != "note_1" {
		t.Errorf("id = %v, want note_1", id)
	}
	if title != "Test Note" {
		t.Errorf("title = %v, want Test Note", title)
	}
	if filePath != "notes/note_1.md" {
		t.Errorf("filePath = %v, want notes/note_1.md", filePath)
	}
	if isFavorite != false {
		t.Errorf("isFavorite = %v, want false", isFavorite)
	}

	// Test UPDATE
	query = `UPDATE notes SET title = ?, is_favorite = ? WHERE id = ?`
	_, err = db.Exec(query, "Updated Note", true, "note_1")
	if err != nil {
		t.Fatalf("Failed to update note: %v", err)
	}

	// Verify update
	err = db.QueryRow("SELECT title, is_favorite FROM notes WHERE id = ?", "note_1").Scan(&title, &isFavorite)
	if err != nil {
		t.Fatalf("Failed to query updated note: %v", err)
	}
	if title != "Updated Note" {
		t.Errorf("title = %v, want Updated Note", title)
	}
	if isFavorite != true {
		t.Errorf("isFavorite = %v, want true", isFavorite)
	}

	// Test DELETE
	query = `DELETE FROM notes WHERE id = ?`
	_, err = db.Exec(query, "note_1")
	if err != nil {
		t.Fatalf("Failed to delete note: %v", err)
	}

	// Verify deletion
	err = db.QueryRow("SELECT id FROM notes WHERE id = ?", "note_1").Scan(&id)
	if err == nil {
		t.Error("Note still exists after deletion")
	}
}

func TestForeignKeyConstraints(t *testing.T) {
	tmpDir := t.TempDir()
	db, err := InitWorkspaceDB(tmpDir)
	if err != nil {
		t.Fatalf("InitWorkspaceDB() failed: %v", err)
	}
	defer db.Close()

	// Create a folder
	_, err = db.Exec("INSERT INTO folders (id, name, position) VALUES (?, ?, ?)", "folder_1", "Test Folder", 0)
	if err != nil {
		t.Fatalf("Failed to insert folder: %v", err)
	}

	// Create a note with folder reference
	_, err = db.Exec("INSERT INTO notes (id, title, folder_id, file_path) VALUES (?, ?, ?, ?)",
		"note_1", "Test Note", "folder_1", "notes/note_1.md")
	if err != nil {
		t.Fatalf("Failed to insert note with folder: %v", err)
	}

	// Delete folder (should set note's folder_id to NULL)
	_, err = db.Exec("DELETE FROM folders WHERE id = ?", "folder_1")
	if err != nil {
		t.Fatalf("Failed to delete folder: %v", err)
	}

	// Verify note's folder_id is NULL
	var folderID *string
	err = db.QueryRow("SELECT folder_id FROM notes WHERE id = ?", "note_1").Scan(&folderID)
	if err != nil {
		t.Fatalf("Failed to query note: %v", err)
	}
	if folderID != nil {
		t.Errorf("folder_id = %v, want NULL", *folderID)
	}
}

func TestMembersTable(t *testing.T) {
	tmpDir := t.TempDir()
	db, err := InitWorkspaceDB(tmpDir)
	if err != nil {
		t.Fatalf("InitWorkspaceDB() failed: %v", err)
	}
	defer db.Close()

	// Test valid roles
	validRoles := []string{"owner", "editor", "viewer"}
	for i, role := range validRoles {
		userID := "user_" + role
		_, err := db.Exec("INSERT INTO members (user_id, email, name, role) VALUES (?, ?, ?, ?)",
			userID, role+"@example.com", "Test User "+string(rune(i)), role)
		if err != nil {
			t.Errorf("Failed to insert member with role %s: %v", role, err)
		}
	}

	// Test invalid role (should fail due to CHECK constraint)
	_, err = db.Exec("INSERT INTO members (user_id, email, name, role) VALUES (?, ?, ?, ?)",
		"user_invalid", "invalid@example.com", "Invalid User", "invalid_role")
	if err == nil {
		t.Error("Expected error for invalid role, got nil")
	}

	// Verify all valid members were inserted
	rows, err := db.Query("SELECT role FROM members ORDER BY role")
	if err != nil {
		t.Fatalf("Failed to query members: %v", err)
	}
	defer rows.Close()

	var count int
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			t.Fatalf("Failed to scan role: %v", err)
		}
		count++
	}

	if count != 3 {
		t.Errorf("Member count = %d, want 3", count)
	}
}
