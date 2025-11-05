package auth

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// GoogleUserInfo represents user information from Google ID token
type GoogleUserInfo struct {
	Sub           string `json:"sub"`            // User ID
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

// ParseIDToken extracts user information from Google ID token
func ParseIDToken(idToken string) (*GoogleUserInfo, error) {
	// ID tokens are JWT format: header.payload.signature
	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid ID token format")
	}

	// Decode payload (base64url)
	payload, err := decodeBase64URL(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode token payload: %w", err)
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(payload, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	return &userInfo, nil
}

// ToUserProfile converts GoogleUserInfo to UserProfile
func (g *GoogleUserInfo) ToUserProfile() *UserProfile {
	return &UserProfile{
		ID:        g.Sub,
		Email:     g.Email,
		Name:      g.Name,
		Picture:   g.Picture,
		CreatedAt: time.Now(),
	}
}

// decodeBase64URL decodes base64url-encoded data (JWT payload)
func decodeBase64URL(s string) ([]byte, error) {
	// Add padding if needed
	switch len(s) % 4 {
	case 2:
		s += "=="
	case 3:
		s += "="
	}

	// Replace URL-safe characters
	s = strings.ReplaceAll(s, "-", "+")
	s = strings.ReplaceAll(s, "_", "/")

	return base64.StdEncoding.DecodeString(s)
}
