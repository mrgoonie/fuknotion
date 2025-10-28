package sync

import (
	"context"
	"encoding/json"
	"fmt"
	"fuknotion/backend/database"
	"fuknotion/backend/models"
	"sync"
	"time"
)

// SyncOperation represents a sync operation type
type SyncOperation string

const (
	OperationCreate SyncOperation = "create"
	OperationUpdate SyncOperation = "update"
	OperationDelete SyncOperation = "delete"
)

// SyncQueueItem represents an item in the sync queue
type SyncQueueItem struct {
	ID        string        `json:"id"`
	NoteID    string        `json:"noteId"`
	Operation SyncOperation `json:"operation"`
	Timestamp time.Time     `json:"timestamp"`
	Retries   int           `json:"retries"`
	Data      []byte        `json:"data"`
}

// SyncQueue manages the synchronization queue
type SyncQueue struct {
	db         *database.DB
	drive      *DriveSync
	queue      []*SyncQueueItem
	mu         sync.RWMutex
	processing bool
	stopChan   chan struct{}
}

// NewSyncQueue creates a new sync queue
func NewSyncQueue(db *database.DB, drive *DriveSync) *SyncQueue {
	return &SyncQueue{
		db:       db,
		drive:    drive,
		queue:    make([]*SyncQueueItem, 0),
		stopChan: make(chan struct{}),
	}
}

// Enqueue adds an item to the sync queue
func (sq *SyncQueue) Enqueue(noteID string, operation SyncOperation, data interface{}) error {
	sq.mu.Lock()
	defer sq.mu.Unlock()

	// Serialize data
	dataBytes, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	item := &SyncQueueItem{
		ID:        fmt.Sprintf("%s-%d", noteID, time.Now().UnixNano()),
		NoteID:    noteID,
		Operation: operation,
		Timestamp: time.Now(),
		Retries:   0,
		Data:      dataBytes,
	}

	sq.queue = append(sq.queue, item)

	// Save queue to database
	if err := sq.saveQueue(); err != nil {
		return fmt.Errorf("failed to save queue: %w", err)
	}

	return nil
}

// Start begins processing the sync queue
func (sq *SyncQueue) Start(ctx context.Context) {
	sq.mu.Lock()
	if sq.processing {
		sq.mu.Unlock()
		return
	}
	sq.processing = true
	sq.mu.Unlock()

	// Load queue from database
	sq.loadQueue()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-sq.stopChan:
			return
		case <-ticker.C:
			sq.processQueue(ctx)
		}
	}
}

// Stop stops the sync queue processor
func (sq *SyncQueue) Stop() {
	sq.mu.Lock()
	defer sq.mu.Unlock()

	if sq.processing {
		close(sq.stopChan)
		sq.processing = false
	}
}

// processQueue processes items in the sync queue
func (sq *SyncQueue) processQueue(ctx context.Context) {
	sq.mu.Lock()
	if len(sq.queue) == 0 || !sq.drive.IsAuthenticated() {
		sq.mu.Unlock()
		return
	}

	// Get first item
	item := sq.queue[0]
	sq.mu.Unlock()

	// Process item
	if err := sq.processItem(ctx, item); err != nil {
		// Handle error - retry or mark as failed
		sq.mu.Lock()
		item.Retries++
		if item.Retries >= 3 {
			// Remove from queue after 3 retries
			sq.queue = sq.queue[1:]
		}
		sq.mu.Unlock()
		return
	}

	// Remove processed item
	sq.mu.Lock()
	sq.queue = sq.queue[1:]
	sq.saveQueue()
	sq.mu.Unlock()
}

// processItem processes a single sync item
func (sq *SyncQueue) processItem(ctx context.Context, item *SyncQueueItem) error {
	switch item.Operation {
	case OperationCreate, OperationUpdate:
		// Get note from database
		note, err := sq.db.GetNote(item.NoteID)
		if err != nil {
			return fmt.Errorf("failed to get note: %w", err)
		}

		// Upload to Google Drive
		content, err := json.Marshal(note)
		if err != nil {
			return fmt.Errorf("failed to marshal note: %w", err)
		}

		// Get app folder
		folderID, err := sq.drive.GetOrCreateAppFolder(ctx)
		if err != nil {
			return fmt.Errorf("failed to get app folder: %w", err)
		}

		// Upload file
		_, err = sq.drive.UploadFile(ctx, note.Title+".json", content, folderID)
		if err != nil {
			return fmt.Errorf("failed to upload file: %w", err)
		}

		return nil

	case OperationDelete:
		// Handle delete operation
		// TODO: Implement delete on Google Drive
		return nil

	default:
		return fmt.Errorf("unknown operation: %s", item.Operation)
	}
}

// saveQueue saves the queue to database
func (sq *SyncQueue) saveQueue() error {
	// TODO: Implement queue persistence to database
	// For now, keep in memory only
	return nil
}

// loadQueue loads the queue from database
func (sq *SyncQueue) loadQueue() error {
	// TODO: Implement queue loading from database
	// For now, start with empty queue
	return nil
}

// GetQueueStatus returns the current queue status
func (sq *SyncQueue) GetQueueStatus() map[string]interface{} {
	sq.mu.RLock()
	defer sq.mu.RUnlock()

	return map[string]interface{}{
		"queueLength": len(sq.queue),
		"processing":  sq.processing,
		"authenticated": sq.drive.IsAuthenticated(),
	}
}
