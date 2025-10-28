package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// DB wraps the SQL database
type DB struct {
	conn *sql.DB
}

// NewDB creates a new database instance
func NewDB(dataDir string) (*DB, error) {
	// Create data directory if it doesn't exist
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	dbPath := filepath.Join(dataDir, "fuknotion.db")

	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Enable WAL mode for better concurrency
	if _, err := conn.Exec("PRAGMA journal_mode=WAL"); err != nil {
		return nil, fmt.Errorf("failed to enable WAL mode: %w", err)
	}

	db := &DB{conn: conn}

	// Run migrations
	if err := db.migrate(); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}

// migrate runs database migrations
func (db *DB) migrate() error {
	schema := `
	CREATE TABLE IF NOT EXISTS workspaces (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	CREATE TABLE IF NOT EXISTS notes (
		id TEXT PRIMARY KEY,
		workspace_id TEXT NOT NULL,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		parent_id TEXT,
		is_favorite BOOLEAN NOT NULL DEFAULT 0,
		is_deleted BOOLEAN NOT NULL DEFAULT 0,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		deleted_at DATETIME,
		FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
		FOREIGN KEY (parent_id) REFERENCES notes(id)
	);

	CREATE TABLE IF NOT EXISTS members (
		id TEXT PRIMARY KEY,
		workspace_id TEXT NOT NULL,
		email TEXT NOT NULL,
		role TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
	);

	CREATE TABLE IF NOT EXISTS sync_status (
		id TEXT PRIMARY KEY,
		note_id TEXT NOT NULL,
		status TEXT NOT NULL,
		error TEXT,
		updated_at DATETIME NOT NULL,
		FOREIGN KEY (note_id) REFERENCES notes(id)
	);

	CREATE INDEX IF NOT EXISTS idx_notes_workspace ON notes(workspace_id);
	CREATE INDEX IF NOT EXISTS idx_notes_parent ON notes(parent_id);
	CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(is_deleted);
	CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite);
	CREATE INDEX IF NOT EXISTS idx_members_workspace ON members(workspace_id);
	CREATE INDEX IF NOT EXISTS idx_sync_status_note ON sync_status(note_id);
	`

	_, err := db.conn.Exec(schema)
	return err
}
