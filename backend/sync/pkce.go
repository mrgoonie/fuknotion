package sync

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
)

// PKCEChallenge represents PKCE code verifier and challenge
type PKCEChallenge struct {
	Verifier  string
	Challenge string
	Method    string
}

// GeneratePKCEChallenge creates a PKCE code verifier and challenge
// as per RFC 7636 (OAuth 2.0 PKCE extension)
//
// The verifier is a cryptographically random string using unreserved characters
// The challenge is base64url(sha256(verifier))
func GeneratePKCEChallenge() (*PKCEChallenge, error) {
	// Generate 32 random bytes (256 bits)
	verifierBytes := make([]byte, 32)
	if _, err := rand.Read(verifierBytes); err != nil {
		return nil, fmt.Errorf("failed to generate random bytes: %w", err)
	}

	// Base64url encode (URL-safe, no padding)
	verifier := base64.RawURLEncoding.EncodeToString(verifierBytes)

	// Create SHA256 hash of verifier
	hash := sha256.Sum256([]byte(verifier))

	// Base64url encode the hash
	challenge := base64.RawURLEncoding.EncodeToString(hash[:])

	return &PKCEChallenge{
		Verifier:  verifier,
		Challenge: challenge,
		Method:    "S256", // SHA256 method
	}, nil
}

// ValidatePKCE validates that the verifier matches the challenge
// Used for testing and verification
func ValidatePKCE(verifier, challenge string) bool {
	hash := sha256.Sum256([]byte(verifier))
	expectedChallenge := base64.RawURLEncoding.EncodeToString(hash[:])
	return challenge == expectedChallenge
}
