package auth

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/99designs/keyring"
	"golang.org/x/oauth2"
)

// SecureStorage provides cross-platform secure token storage
type SecureStorage struct {
	ring keyring.Keyring
}

// TokenData represents stored OAuth token data
type TokenData struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	TokenType    string    `json:"token_type"`
	Expiry       time.Time `json:"expiry"`
	IDToken      string    `json:"id_token,omitempty"`
}

// UserProfile represents stored user profile data
type UserProfile struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Picture   string `json:"picture,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// NewSecureStorage creates a new secure storage instance
func NewSecureStorage(appName string) (*SecureStorage, error) {
	ring, err := keyring.Open(keyring.Config{
		ServiceName:              appName,
		KeychainName:             appName,
		KeychainTrustApplication: true, // Don't prompt on every access (macOS)
		FileDir:                  fmt.Sprintf("~/.%s", appName),
		FilePasswordFunc: func(prompt string) (string, error) {
			return "fuknotion-secure-storage", nil
		},

		// Prefer system keychains, fall back to encrypted file
		AllowedBackends: []keyring.BackendType{
			keyring.KeychainBackend,      // macOS Keychain
			keyring.WinCredBackend,       // Windows Credential Manager
			keyring.SecretServiceBackend, // Linux Secret Service
			keyring.FileBackend,          // Encrypted file fallback
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to open keyring: %w", err)
	}

	return &SecureStorage{ring: ring}, nil
}

// SaveGoogleToken stores Google OAuth token securely
func (s *SecureStorage) SaveGoogleToken(token *oauth2.Token) error {
	tokenData := TokenData{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		TokenType:    token.TokenType,
		Expiry:       token.Expiry,
	}

	// Extract ID token if present
	if idToken, ok := token.Extra("id_token").(string); ok {
		tokenData.IDToken = idToken
	}

	data, err := json.Marshal(tokenData)
	if err != nil {
		return fmt.Errorf("failed to marshal token: %w", err)
	}

	err = s.ring.Set(keyring.Item{
		Key:  "google_oauth_token",
		Data: data,
	})

	if err != nil {
		return fmt.Errorf("failed to save token to keyring: %w", err)
	}

	return nil
}

// LoadGoogleToken retrieves Google OAuth token from secure storage
func (s *SecureStorage) LoadGoogleToken() (*oauth2.Token, error) {
	item, err := s.ring.Get("google_oauth_token")
	if err != nil {
		if err == keyring.ErrKeyNotFound {
			return nil, nil // No token stored
		}
		return nil, fmt.Errorf("failed to load token from keyring: %w", err)
	}

	var tokenData TokenData
	if err := json.Unmarshal(item.Data, &tokenData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal token: %w", err)
	}

	token := &oauth2.Token{
		AccessToken:  tokenData.AccessToken,
		RefreshToken: tokenData.RefreshToken,
		TokenType:    tokenData.TokenType,
		Expiry:       tokenData.Expiry,
	}

	// Restore ID token if present
	if tokenData.IDToken != "" {
		token = token.WithExtra(map[string]interface{}{
			"id_token": tokenData.IDToken,
		})
	}

	return token, nil
}

// SaveUserProfile stores user profile data
func (s *SecureStorage) SaveUserProfile(profile *UserProfile) error {
	data, err := json.Marshal(profile)
	if err != nil {
		return fmt.Errorf("failed to marshal profile: %w", err)
	}

	err = s.ring.Set(keyring.Item{
		Key:  "user_profile",
		Data: data,
	})

	if err != nil {
		return fmt.Errorf("failed to save profile to keyring: %w", err)
	}

	return nil
}

// LoadUserProfile retrieves user profile from secure storage
func (s *SecureStorage) LoadUserProfile() (*UserProfile, error) {
	item, err := s.ring.Get("user_profile")
	if err != nil {
		if err == keyring.ErrKeyNotFound {
			return nil, nil // No profile stored
		}
		return nil, fmt.Errorf("failed to load profile from keyring: %w", err)
	}

	var profile UserProfile
	if err := json.Unmarshal(item.Data, &profile); err != nil {
		return nil, fmt.Errorf("failed to unmarshal profile: %w", err)
	}

	return &profile, nil
}

// DeleteAll removes all stored credentials
func (s *SecureStorage) DeleteAll() error {
	// Delete tokens
	s.ring.Remove("google_oauth_token")

	// Delete profile
	s.ring.Remove("user_profile")

	return nil
}

// IsTokenExpired checks if the token is expired
func (s *SecureStorage) IsTokenExpired(token *oauth2.Token) bool {
	if token == nil {
		return true
	}
	// Consider token expired if less than 5 minutes remaining
	return token.Expiry.Add(-5 * time.Minute).Before(time.Now())
}
