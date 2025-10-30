package sync

import (
	"encoding/json"
	"fmt"

	"github.com/99designs/keyring"
	"golang.org/x/oauth2"
)

const (
	keyringService = "fuknotion"
	tokenKey       = "google_oauth_token"
)

// KeyringStore provides secure token storage using OS keychain
// - macOS: Keychain
// - Windows: Credential Manager
// - Linux: Secret Service (requires libsecret)
type KeyringStore struct {
	ring keyring.Keyring
}

// NewKeyringStore creates a new keyring store
func NewKeyringStore() (*KeyringStore, error) {
	// Configure keyring with multiple backends
	// Prioritize: keychain (macOS) > wincred (Windows) > secret-service (Linux) > file (fallback)
	ring, err := keyring.Open(keyring.Config{
		ServiceName:              keyringService,
		AllowedBackends:          []keyring.BackendType{keyring.KeychainBackend, keyring.WinCredBackend, keyring.SecretServiceBackend, keyring.FileBackend},
		KeychainName:             "fuknotion",
		FileDir:                  "~/.fuknotion",
		FilePasswordFunc:         keyring.FixedStringPrompt("fuknotion-secure-storage"),
		KeychainTrustApplication: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to open keyring: %w", err)
	}

	return &KeyringStore{ring: ring}, nil
}

// SaveToken stores OAuth2 token securely in keyring
func (k *KeyringStore) SaveToken(token *oauth2.Token) error {
	if token == nil {
		return fmt.Errorf("token cannot be nil")
	}

	// Serialize token to JSON
	data, err := json.Marshal(token)
	if err != nil {
		return fmt.Errorf("failed to marshal token: %w", err)
	}

	// Store in keyring
	item := keyring.Item{
		Key:  tokenKey,
		Data: data,
	}

	if err := k.ring.Set(item); err != nil {
		return fmt.Errorf("failed to save token to keyring: %w", err)
	}

	return nil
}

// LoadToken retrieves OAuth2 token from keyring
func (k *KeyringStore) LoadToken() (*oauth2.Token, error) {
	item, err := k.ring.Get(tokenKey)
	if err != nil {
		if err == keyring.ErrKeyNotFound {
			return nil, nil // Token not found, not an error
		}
		return nil, fmt.Errorf("failed to load token from keyring: %w", err)
	}

	// Deserialize token from JSON
	var token oauth2.Token
	if err := json.Unmarshal(item.Data, &token); err != nil {
		return nil, fmt.Errorf("failed to unmarshal token: %w", err)
	}

	return &token, nil
}

// DeleteToken removes OAuth2 token from keyring
func (k *KeyringStore) DeleteToken() error {
	if err := k.ring.Remove(tokenKey); err != nil {
		if err == keyring.ErrKeyNotFound {
			return nil // Already deleted, not an error
		}
		return fmt.Errorf("failed to delete token from keyring: %w", err)
	}

	return nil
}

// HasToken checks if token exists in keyring
func (k *KeyringStore) HasToken() bool {
	_, err := k.ring.Get(tokenKey)
	return err == nil
}
