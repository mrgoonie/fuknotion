package app

import (
	"fmt"
	"time"

	"fuknotion/backend/internal/auth"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/oauth2"
)

// UserInfo represents user information for the frontend
type UserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

// GoogleSignIn initiates the Google OAuth flow
func (a *App) GoogleSignIn() error {
	if a.oauthService == nil {
		return fmt.Errorf("authentication not configured - please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET")
	}

	// Generate auth URL
	authURL, err := a.oauthService.StartAuth()
	if err != nil {
		return fmt.Errorf("failed to start auth: %w", err)
	}

	// Open system browser
	runtime.BrowserOpenURL(a.ctx, authURL)

	// Start callback server and wait for token
	token, err := a.oauthService.StartCallbackServer(a.ctx)
	if err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	// Extract user info from ID token
	idToken, ok := token.Extra("id_token").(string)
	if !ok {
		return fmt.Errorf("no ID token in response")
	}

	userInfo, err := auth.ParseIDToken(idToken)
	if err != nil {
		return fmt.Errorf("failed to parse user info: %w", err)
	}

	// Save user profile to database
	if err := a.saveUserProfile(userInfo.ToUserProfile()); err != nil {
		return fmt.Errorf("failed to save user profile: %w", err)
	}

	// Start session manager with auto-refresh
	err = a.sessionManager.Start(token, func(refreshedToken *oauth2.Token) error {
		// Token was refreshed, persist it
		fmt.Println("Token refreshed, saving to storage...")
		return nil // Storage is already handled in SessionManager
	})

	if err != nil {
		return fmt.Errorf("failed to start session: %w", err)
	}

	fmt.Printf("User %s (%s) signed in successfully\n", userInfo.Name, userInfo.Email)

	return nil
}

// GetCurrentUser returns the currently logged-in user
func (a *App) GetCurrentUser() (*UserInfo, error) {
	if a.storage == nil {
		return nil, fmt.Errorf("authentication not configured")
	}

	// Load user profile from storage
	profile, err := a.storage.LoadUserProfile()
	if err != nil {
		return nil, fmt.Errorf("failed to load user profile: %w", err)
	}

	if profile == nil {
		return nil, nil // No user logged in
	}

	return &UserInfo{
		ID:      profile.ID,
		Email:   profile.Email,
		Name:    profile.Name,
		Picture: profile.Picture,
	}, nil
}

// IsAuthenticated checks if the user is authenticated with a valid token
func (a *App) IsAuthenticated() bool {
	if a.sessionManager == nil {
		return false
	}

	token := a.sessionManager.GetToken()
	if token == nil {
		return false
	}

	// Check if token is expired
	return !a.storage.IsTokenExpired(token)
}

// Logout logs out the current user and clears all credentials
func (a *App) Logout() error {
	if a.sessionManager == nil {
		return fmt.Errorf("authentication not configured")
	}

	if err := a.sessionManager.Logout(); err != nil {
		return fmt.Errorf("logout failed: %w", err)
	}

	fmt.Println("User logged out successfully")
	return nil
}

// GetAccessToken returns a valid access token for API calls (refreshes if needed)
func (a *App) GetAccessToken() (string, error) {
	if a.sessionManager == nil {
		return "", fmt.Errorf("authentication not configured")
	}

	token, err := a.sessionManager.GetValidToken()
	if err != nil {
		return "", fmt.Errorf("failed to get valid token: %w", err)
	}

	return token.AccessToken, nil
}

// saveUserProfile saves user profile to user.db
func (a *App) saveUserProfile(profile *auth.UserProfile) error {
	if a.userDB == nil {
		return fmt.Errorf("user database not initialized")
	}

	// Save to secure storage (keyring)
	if err := a.storage.SaveUserProfile(profile); err != nil {
		return fmt.Errorf("failed to save profile to storage: %w", err)
	}

	// Also save to user.db for persistence
	query := `
		INSERT OR REPLACE INTO user (id, name, email, avatar_url, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	_, err := a.userDB.Exec(query,
		profile.ID,
		profile.Name,
		profile.Email,
		profile.Picture,
		profile.CreatedAt,
		time.Now(),
	)

	return err
}
