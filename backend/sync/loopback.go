package sync

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"sync"
	"time"
)

const (
	loopbackPort = "34116" // Different port from Wails dev server (34115)
	loopbackAddr = "127.0.0.1:" + loopbackPort
	callbackPath = "/callback"
)

// LoopbackServer handles OAuth callback in desktop app
type LoopbackServer struct {
	server      *http.Server
	authCode    string
	authError   string
	state       string
	mu          sync.Mutex
	done        chan struct{}
	isListening bool
}

// NewLoopbackServer creates a new loopback HTTP server
func NewLoopbackServer() *LoopbackServer {
	return &LoopbackServer{
		done: make(chan struct{}),
	}
}

// Start begins listening for OAuth callback
func (l *LoopbackServer) Start() error {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.isListening {
		return fmt.Errorf("loopback server already running")
	}

	// Generate random state for CSRF protection
	stateBytes := make([]byte, 16)
	if _, err := rand.Read(stateBytes); err != nil {
		return fmt.Errorf("failed to generate state: %w", err)
	}
	l.state = base64.URLEncoding.EncodeToString(stateBytes)

	// Create HTTP handler
	mux := http.NewServeMux()
	mux.HandleFunc(callbackPath, l.handleCallback)

	// Create server
	l.server = &http.Server{
		Addr:           loopbackAddr,
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Start server in goroutine
	go func() {
		if err := l.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			l.mu.Lock()
			l.authError = fmt.Sprintf("Server error: %v", err)
			l.mu.Unlock()
			close(l.done)
		}
	}()

	l.isListening = true
	return nil
}

// GetState returns the CSRF state token
func (l *LoopbackServer) GetState() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.state
}

// GetRedirectURL returns the callback URL
func (l *LoopbackServer) GetRedirectURL() string {
	return "http://" + loopbackAddr + callbackPath
}

// handleCallback processes OAuth callback request
func (l *LoopbackServer) handleCallback(w http.ResponseWriter, r *http.Request) {
	l.mu.Lock()
	defer l.mu.Unlock()

	// Parse query parameters
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	errorParam := r.URL.Query().Get("error")
	errorDesc := r.URL.Query().Get("error_description")

	// Validate state (CSRF protection)
	if state != l.state {
		l.authError = "Invalid state parameter (CSRF detected)"
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, htmlResponse("Authentication Failed", "Security validation failed. Please try again."))
		close(l.done)
		return
	}

	// Check for OAuth error
	if errorParam != "" {
		l.authError = fmt.Sprintf("OAuth error: %s - %s", errorParam, errorDesc)
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, htmlResponse("Authentication Failed", l.authError))
		close(l.done)
		return
	}

	// Validate code
	if code == "" {
		l.authError = "Missing authorization code"
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, htmlResponse("Authentication Failed", "No authorization code received."))
		close(l.done)
		return
	}

	// Success - store code
	l.authCode = code

	// Send success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, htmlResponse("Success!", "Authentication successful. You can close this window and return to Fuknotion."))

	// Signal completion
	close(l.done)
}

// WaitForCode blocks until callback is received or timeout
func (l *LoopbackServer) WaitForCode(timeout time.Duration) (string, error) {
	timer := time.NewTimer(timeout)
	defer timer.Stop()

	select {
	case <-l.done:
		l.mu.Lock()
		defer l.mu.Unlock()

		if l.authError != "" {
			return "", fmt.Errorf("authentication failed: %s", l.authError)
		}
		return l.authCode, nil

	case <-timer.C:
		return "", fmt.Errorf("authentication timeout after %v", timeout)
	}
}

// Stop gracefully shuts down the server
func (l *LoopbackServer) Stop() error {
	l.mu.Lock()
	defer l.mu.Unlock()

	if l.server == nil || !l.isListening {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := l.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("failed to shutdown server: %w", err)
	}

	l.isListening = false
	return nil
}

// htmlResponse generates a simple HTML response
func htmlResponse(title, message string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>%s</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100vh;
			margin: 0;
			background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
		}
		.container {
			background: white;
			padding: 48px;
			border-radius: 16px;
			box-shadow: 0 10px 40px rgba(0,0,0,0.2);
			text-align: center;
			max-width: 400px;
		}
		h1 {
			color: #333;
			margin: 0 0 16px 0;
			font-size: 24px;
		}
		p {
			color: #666;
			margin: 0;
			font-size: 16px;
			line-height: 1.5;
		}
		.icon {
			font-size: 48px;
			margin-bottom: 16px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="icon">%s</div>
		<h1>%s</h1>
		<p>%s</p>
	</div>
	<script>
		// Auto-close window after 3 seconds
		setTimeout(() => window.close(), 3000);
	</script>
</body>
</html>`, title, getIcon(title), title, message)
}

// getIcon returns emoji based on title
func getIcon(title string) string {
	if title == "Success!" {
		return "✅"
	}
	return "❌"
}
