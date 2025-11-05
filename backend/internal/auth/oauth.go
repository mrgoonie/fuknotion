package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// OAuthService handles Google OAuth 2.0 authentication with PKCE
type OAuthService struct {
	config       *oauth2.Config
	server       *http.Server
	verifier     string
	tokenChan    chan *oauth2.Token
	errChan      chan error
	callbackPort int
}

// NewOAuthService creates a new OAuth service
func NewOAuthService(clientID, clientSecret string) *OAuthService {
	return &OAuthService{
		config: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  "http://localhost:9999/callback",
			Scopes: []string{
				"openid",
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/drive.file", // Per-file Drive access
			},
			Endpoint: google.Endpoint,
		},
		tokenChan:    make(chan *oauth2.Token, 1),
		errChan:      make(chan error, 1),
		callbackPort: 9999,
	}
}

// GeneratePKCE generates PKCE code verifier and challenge
func (o *OAuthService) GeneratePKCE() (verifier, challenge string, err error) {
	// Generate 32 random bytes (256 bits)
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	// Base64url encode (no padding)
	verifier = base64.RawURLEncoding.EncodeToString(b)

	// SHA256 hash
	h := sha256.New()
	h.Write([]byte(verifier))
	challenge = base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	return verifier, challenge, nil
}

// StartAuth initiates the OAuth flow and opens the browser
func (o *OAuthService) StartAuth() (string, error) {
	// Generate PKCE parameters
	verifier, challenge, err := o.GeneratePKCE()
	if err != nil {
		return "", err
	}
	o.verifier = verifier

	// Build auth URL with PKCE and offline access
	authURL := o.config.AuthCodeURL("state-token",
		oauth2.AccessTypeOffline,                          // Get refresh token
		oauth2.SetAuthURLParam("prompt", "consent"),       // Force consent screen
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	)

	return authURL, nil
}

// StartCallbackServer starts a temporary HTTP server to receive OAuth callback
func (o *OAuthService) StartCallbackServer(ctx context.Context) (*oauth2.Token, error) {
	mux := http.NewServeMux()
	mux.HandleFunc("/callback", o.handleCallback)

	o.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", o.callbackPort),
		Handler: mux,
	}

	// Start server in background
	go func() {
		if err := o.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			o.errChan <- fmt.Errorf("callback server error: %w", err)
		}
	}()

	// Wait for token, error, or timeout
	select {
	case token := <-o.tokenChan:
		o.shutdownServer()
		return token, nil
	case err := <-o.errChan:
		o.shutdownServer()
		return nil, err
	case <-time.After(5 * time.Minute):
		o.shutdownServer()
		return nil, fmt.Errorf("authentication timeout")
	case <-ctx.Done():
		o.shutdownServer()
		return nil, ctx.Err()
	}
}

// handleCallback processes the OAuth callback
func (o *OAuthService) handleCallback(w http.ResponseWriter, r *http.Request) {
	// Validate state parameter (CSRF protection)
	if r.URL.Query().Get("state") != "state-token" {
		o.errChan <- fmt.Errorf("invalid state parameter")
		http.Error(w, "Invalid state", http.StatusBadRequest)
		return
	}

	// Get authorization code
	code := r.URL.Query().Get("code")
	if code == "" {
		o.errChan <- fmt.Errorf("no authorization code")
		http.Error(w, "No authorization code", http.StatusBadRequest)
		return
	}

	// Exchange code for token (with PKCE verifier)
	token, err := o.config.Exchange(context.Background(), code,
		oauth2.SetAuthURLParam("code_verifier", o.verifier),
	)
	if err != nil {
		o.errChan <- fmt.Errorf("token exchange failed: %w", err)
		http.Error(w, "Token exchange failed", http.StatusInternalServerError)
		return
	}

	// Send success response to browser
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	html := `<!DOCTYPE html>
<html>
<head>
	<title>Authentication Successful</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100vh;
			margin: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
		.container {
			background: white;
			padding: 3rem;
			border-radius: 1rem;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			text-align: center;
			max-width: 400px;
		}
		h1 {
			color: #2d3748;
			margin: 0 0 1rem 0;
			font-size: 1.75rem;
		}
		p {
			color: #718096;
			margin: 0;
			line-height: 1.6;
		}
		.success-icon {
			font-size: 4rem;
			margin-bottom: 1rem;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="success-icon">✓</div>
		<h1>Authentication Successful!</h1>
		<p>You can now close this window and return to Fuknotion.</p>
	</div>
	<script>
		// Auto-close after 2 seconds
		setTimeout(() => window.close(), 2000);
	</script>
</body>
</html>`
	w.Write([]byte(html))

	// Send token to main flow
	o.tokenChan <- token
}

// shutdownServer gracefully shuts down the callback server
func (o *OAuthService) shutdownServer() {
	if o.server != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		o.server.Shutdown(ctx)
	}
}

// RefreshToken refreshes an expired access token using the refresh token
func (o *OAuthService) RefreshToken(ctx context.Context, refreshToken string) (*oauth2.Token, error) {
	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}

	tokenSource := o.config.TokenSource(ctx, token)
	newToken, err := tokenSource.Token()
	if err != nil {
		return nil, fmt.Errorf("token refresh failed: %w", err)
	}

	return newToken, nil
}
