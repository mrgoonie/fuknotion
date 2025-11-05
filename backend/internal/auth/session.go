package auth

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"golang.org/x/oauth2"
)

// SessionManager manages OAuth session lifecycle with auto-refresh
type SessionManager struct {
	mu            sync.RWMutex
	oauth         *OAuthService
	storage       *SecureStorage
	token         *oauth2.Token
	refreshTicker *time.Ticker
	stopChan      chan struct{}
	onRefresh     func(*oauth2.Token) error
	ctx           context.Context
}

// NewSessionManager creates a new session manager
func NewSessionManager(ctx context.Context, oauth *OAuthService, storage *SecureStorage) *SessionManager {
	return &SessionManager{
		oauth:    oauth,
		storage:  storage,
		stopChan: make(chan struct{}),
		ctx:      ctx,
	}
}

// Start initializes the session manager and starts auto-refresh if needed
func (sm *SessionManager) Start(token *oauth2.Token, onRefresh func(*oauth2.Token) error) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sm.token = token
	sm.onRefresh = onRefresh

	// Save initial token
	if err := sm.storage.SaveGoogleToken(token); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	// Start auto-refresh
	sm.startAutoRefresh()

	return nil
}

// startAutoRefresh starts the token refresh ticker
func (sm *SessionManager) startAutoRefresh() {
	// Calculate refresh interval (75% of token lifetime)
	// Google tokens typically expire in 1 hour
	tokenLifetime := time.Until(sm.token.Expiry)
	if tokenLifetime <= 0 {
		// Token already expired, refresh immediately
		go sm.refresh()
		tokenLifetime = 55 * time.Minute // Default to 55 minutes for next refresh
	}

	refreshInterval := tokenLifetime * 3 / 4
	if refreshInterval < 1*time.Minute {
		refreshInterval = 1 * time.Minute // Minimum 1 minute
	}

	log.Printf("Token refresh scheduled in %v (expires at %v)", refreshInterval, sm.token.Expiry)

	sm.refreshTicker = time.NewTicker(refreshInterval)

	go func() {
		for {
			select {
			case <-sm.refreshTicker.C:
				if err := sm.refresh(); err != nil {
					log.Printf("Token refresh failed: %v, retrying...", err)
					sm.retryRefresh()
				}
			case <-sm.stopChan:
				sm.refreshTicker.Stop()
				return
			}
		}
	}()
}

// refresh refreshes the access token
func (sm *SessionManager) refresh() error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	log.Println("Refreshing access token...")

	// Refresh token using OAuth service
	newToken, err := sm.oauth.RefreshToken(sm.ctx, sm.token.RefreshToken)
	if err != nil {
		return fmt.Errorf("refresh failed: %w", err)
	}

	// Preserve refresh token if not returned in response
	if newToken.RefreshToken == "" {
		newToken.RefreshToken = sm.token.RefreshToken
	}

	// Update stored token
	sm.token = newToken

	// Save to secure storage
	if err := sm.storage.SaveGoogleToken(newToken); err != nil {
		return fmt.Errorf("failed to save refreshed token: %w", err)
	}

	// Call refresh callback
	if sm.onRefresh != nil {
		if err := sm.onRefresh(newToken); err != nil {
			log.Printf("onRefresh callback failed: %v", err)
		}
	}

	// Update ticker for next refresh
	tokenLifetime := time.Until(newToken.Expiry)
	refreshInterval := tokenLifetime * 3 / 4
	if refreshInterval < 1*time.Minute {
		refreshInterval = 1 * time.Minute
	}

	sm.refreshTicker.Reset(refreshInterval)

	log.Printf("Token refreshed successfully, next refresh in %v", refreshInterval)

	return nil
}

// retryRefresh implements exponential backoff retry logic
func (sm *SessionManager) retryRefresh() {
	backoff := 5 * time.Second
	maxRetries := 3

	for i := 0; i < maxRetries; i++ {
		log.Printf("Retry %d/%d: waiting %v before retry...", i+1, maxRetries, backoff)
		time.Sleep(backoff)

		if err := sm.refresh(); err == nil {
			log.Println("Token refresh succeeded on retry")
			return
		}

		backoff *= 2 // Exponential backoff
	}

	// All retries failed
	log.Println("Token refresh failed after all retries. User needs to re-authenticate.")
	sm.Stop()
	// TODO: Trigger re-login flow in app
}

// GetToken returns the current token (thread-safe)
func (sm *SessionManager) GetToken() *oauth2.Token {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return sm.token
}

// GetValidToken returns a valid (non-expired) token, refreshing if necessary
func (sm *SessionManager) GetValidToken() (*oauth2.Token, error) {
	sm.mu.RLock()
	token := sm.token
	sm.mu.RUnlock()

	// Check if token is expired
	if sm.storage.IsTokenExpired(token) {
		log.Println("Token expired, refreshing...")
		if err := sm.refresh(); err != nil {
			return nil, fmt.Errorf("failed to refresh expired token: %w", err)
		}
		return sm.GetToken(), nil
	}

	return token, nil
}

// RestoreSession attempts to restore a session from storage
func (sm *SessionManager) RestoreSession(onRefresh func(*oauth2.Token) error) error {
	token, err := sm.storage.LoadGoogleToken()
	if err != nil {
		return fmt.Errorf("failed to load token: %w", err)
	}

	if token == nil {
		return fmt.Errorf("no stored token found")
	}

	return sm.Start(token, onRefresh)
}

// Stop stops the auto-refresh ticker
func (sm *SessionManager) Stop() {
	close(sm.stopChan)
}

// Logout clears all stored credentials
func (sm *SessionManager) Logout() error {
	sm.Stop()

	sm.mu.Lock()
	defer sm.mu.Unlock()

	sm.token = nil

	if err := sm.storage.DeleteAll(); err != nil {
		return fmt.Errorf("failed to clear credentials: %w", err)
	}

	log.Println("User logged out successfully")
	return nil
}
