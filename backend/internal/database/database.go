package database

import (
	"database/sql"
	"fmt"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// Database wraps SQLite connection
type Database struct {
	db   *sql.DB
	path string
}

// Open opens or creates a SQLite database
func Open(dbPath string) (*Database, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Enable foreign keys
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	return &Database{db: db, path: dbPath}, nil
}

// Close closes the database connection
func (d *Database) Close() error {
	if d.db != nil {
		return d.db.Close()
	}
	return nil
}

// Exec executes a query without returning rows
func (d *Database) Exec(query string, args ...interface{}) (sql.Result, error) {
	return d.db.Exec(query, args...)
}

// Query executes a query that returns rows
func (d *Database) Query(query string, args ...interface{}) (*sql.Rows, error) {
	return d.db.Query(query, args...)
}

// QueryRow executes a query that returns at most one row
func (d *Database) QueryRow(query string, args ...interface{}) *sql.Row {
	return d.db.QueryRow(query, args...)
}

// InitUserDB initializes the user database schema
func InitUserDB(basePath string) (*Database, error) {
	dbPath := filepath.Join(basePath, "user.db")
	db, err := Open(dbPath)
	if err != nil {
		return nil, err
	}

	schema := `
	CREATE TABLE IF NOT EXISTS user (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT,
		avatar_url TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS workspaces (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		path TEXT NOT NULL UNIQUE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	if _, err := db.Exec(schema); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize user database: %w", err)
	}

	return db, nil
}

// InitWorkspaceDB initializes a workspace database schema
func InitWorkspaceDB(workspacePath string) (*Database, error) {
	dbPath := filepath.Join(workspacePath, "workspace.db")
	db, err := Open(dbPath)
	if err != nil {
		return nil, err
	}

	schema := `
	CREATE TABLE IF NOT EXISTS notes (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		folder_id TEXT,
		file_path TEXT NOT NULL UNIQUE,
		is_favorite BOOLEAN DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
	);

	CREATE TABLE IF NOT EXISTS folders (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		parent_id TEXT,
		position INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS members (
		user_id TEXT PRIMARY KEY,
		email TEXT NOT NULL,
		name TEXT NOT NULL,
		role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
		joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
	CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite);
	CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
	CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
	CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

	-- Full-text search table
	CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
		note_id UNINDEXED,
		title,
		content,
		tokenize='porter unicode61'
	);

	-- Triggers to keep FTS in sync with notes table
	CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
		INSERT INTO notes_fts(rowid, note_id, title, content)
		VALUES (new.rowid, new.id, new.title, '');
	END;

	CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
		DELETE FROM notes_fts WHERE rowid = old.rowid;
	END;

	CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
		UPDATE notes_fts SET title = new.title WHERE rowid = new.rowid;
	END;
	`

	if _, err := db.Exec(schema); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize workspace database: %w", err)
	}

	return db, nil
}
