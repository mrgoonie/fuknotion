# Research Report: Supabase Auth for Wails Desktop Apps (Go + React)

**Research Date:** 2025-11-05
**Researcher:** Claude Code
**Topic:** Supabase Auth implementation for desktop/native apps with OAuth 2.0 PKCE, Google OAuth, session management, and offline capabilities

---

## Executive Summary

Supabase Auth supports desktop applications through PKCE OAuth flow, but requires manual implementation in Go as official Go SDK (supabase-community/supabase-go) is pre-release. Key findings:

1. **PKCE Flow:** Supabase requires server-side code exchange; client libraries auto-handle code verifier generation/storage
2. **Go SDKs:** Two community options exist (`supabase-community/auth-go`, `nedpals/supabase-go`) - both pre-release/unofficial
3. **Wails OAuth:** Temporary localhost HTTP server pattern (port 8000-9999) recommended for callback handling
4. **Google OAuth:** Requires `access_type: 'offline'` + `prompt: 'consent'` to obtain refresh tokens for Drive API
5. **Token Storage:** Use `99designs/keyring` for cross-platform secure storage (Keychain/Credential Manager/Secret Service)
6. **Session Refresh:** Manual implementation needed; JS SDK has auto-refresh, Go SDK lacks feature parity
7. **Offline Mode:** Supabase Auth doesn't support offline - consider PowerSync/RxDB for local-first database sync

**Critical Limitation:** supabase-go is "pre-release work in progress, not production-ready, API subject to breaking changes"

---

## Research Methodology

- **Sources consulted:** 45+ (official docs, GitHub repos, community discussions, technical blogs)
- **Date range:** Jan 2024 - Nov 2025 (focused on 2025 docs)
- **Key search terms:** Supabase Auth desktop, PKCE Go, supabase-go SDK, Wails OAuth, token refresh, offline mode
- **Code analysis:** Analyzed supabase-community/supabase-go (5.3k tokens), auth-go (35.5k tokens), douglasmakey/oauth2-example

---

## Key Findings

### 1. Supabase Auth PKCE Flow

#### How It Works

PKCE (Proof Key for Code Exchange) is OAuth 2.0 extension for public clients (desktop/mobile apps without client secrets).

**Flow Sequence:**
1. App generates `code_verifier` (random 43-128 char string) and `code_challenge` (SHA256 hash, base64url-encoded)
2. User redirects to auth provider with `code_challenge`
3. Provider redirects back with temporary `code` (5min validity, single-use)
4. App exchanges `code` + `code_verifier` for access/refresh tokens via `exchangeCodeForSession()`

**Critical Requirements:**
- Code exchange must occur on same device/browser where flow started (code verifier stored locally)
- Code expires in 5 minutes and can only be exchanged once
- Failed exchange requires restarting entire auth flow

#### Supabase-Specific Implementation

Supabase client config:
```javascript
// JS SDK reference (no Go equivalent exists)
const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: true,  // Auto-exchange code on redirect
    flowType: 'pkce',
    storage: customStorageAdapter,  // Required for non-browser envs
  },
})
```

**Go Limitation:** No equivalent auto-detection; manual code extraction + exchange required.

---

### 2. Go SDK Options & Capabilities

#### supabase-community/auth-go

**Status:** Pre-release, community-maintained
**Repository:** github.com/supabase-community/auth-go
**Size:** 63 files, 35.5k tokens

**Key Methods:**
```go
// PKCE token exchange
token, err := client.Token(auth.TokenRequest{
    GrantType:    "pkce",
    Code:         "<auth_code>",
    CodeVerifier: "<code_verifier>",
})

// Email/password sign-in
session, err := client.SignInWithEmailPassword("user@example.com", "password")

// Token refresh
newSession, err := client.RefreshToken(refreshToken)

// ID token sign-in (for Google/Apple/etc)
session, err := client.SignInWithIdToken(provider, idToken, nonce, accessToken, captchaToken)
```

**Notable Features:**
- PKCE code exchange support via `TokenRequest` with `GrantType: "pkce"`
- Returns `types.TokenResponse` with `AccessToken`, `RefreshToken`, `ExpiresIn`, `User`
- No auto-refresh implementation (manual refresh required)

**Limitations:**
- No session management layer (must implement own)
- No storage abstraction
- No provider token extraction for Google/GitHub OAuth

#### nedpals/supabase-go

**Status:** Unofficial, amalgamation library
**Repository:** github.com/nedpals/supabase-go

**Key Methods:**
```go
client := supa.CreateClient(supabaseUrl, supabaseKey)

// PKCE code exchange
authenticated, err := client.Auth.ExchangeCode(ctx, supa.ExchangeCodeOpts{
    AuthCode:     "<auth_code>",
    CodeVerifier: "<code_verifier>",
})

// Email sign-in
user, err := client.Auth.SignIn(ctx, credentials)
```

**Differences from auth-go:**
- Higher-level API (includes database, storage, functions)
- Context-aware methods
- More "JavaScript SDK-like" API surface

**Limitations:**
- Same lack of auto-refresh as auth-go
- Unclear maintenance status

#### Recommendation

Use `supabase-community/auth-go` for auth-only needs (more focused, better documented). For full Supabase feature set, evaluate `nedpals/supabase-go`. **Both unsuitable for production per maintainer warnings.**

---

### 3. PKCE Code Verifier/Challenge Generation in Go

#### Using matthewhartstonge/pkce Package

**Installation:**
```bash
go get github.com/matthewhartstonge/pkce
```

**RFC 7636 Compliant Implementation:**
```go
import "github.com/matthewhartstonge/pkce"

// Struct-based approach
key, err := pkce.New(
    pkce.WithChallengeMethod(pkce.S256),     // SHA256 (recommended)
    pkce.WithCodeVerifierLength(128),        // 128 chars (max security)
)
if err != nil {
    return err
}

verifier := key.CodeVerifier()   // Store securely for token exchange
challenge := key.CodeChallenge() // Send to auth provider

// Functional approach
verifier, _ := pkce.GenerateCodeVerifier(128)
challenge, _ := pkce.GenerateCodeChallenge(pkce.S256, verifier)
```

**Challenge Methods:**
- **S256** (mandatory): `BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))`
- **Plain** (compatibility only): `code_challenge = code_verifier`

**Key Parameters:**
- Code verifier: 43-128 chars, cryptographically random, URL-safe
- Code challenge: Base64url-encoded (no padding)
- Store verifier securely until token exchange (in-memory or encrypted storage)

#### Manual Implementation (Standard Library)

```go
import (
    "crypto/rand"
    "crypto/sha256"
    "encoding/base64"
    "io"
)

func generateCodeVerifier() (string, error) {
    b := make([]byte, 32) // 32 bytes = 256 bits entropy
    if _, err := io.ReadFull(rand.Reader, b); err != nil {
        return "", err
    }
    return base64.RawURLEncoding.EncodeToString(b), nil
}

func generateCodeChallenge(verifier string) string {
    h := sha256.New()
    h.Write([]byte(verifier))
    return base64.RawURLEncoding.EncodeToString(h.Sum(nil))
}
```

---

### 4. Wails Desktop OAuth Implementation Pattern

#### Recommended Approach: Temporary Localhost Server

From Wails GitHub discussions (#392), consensus pattern:

**Architecture:**
1. Start temporary HTTP server on localhost:9999 when auth needed
2. Register `http://localhost:9999/callback` with OAuth provider
3. Open system browser to provider's auth URL
4. Provider redirects to localhost callback with `code`
5. Server captures code, exchanges for tokens, shuts down

**Key Advantages:**
- Works with standard OAuth2 flows (no custom protocol handlers)
- Avoids Wails IPC complexity for HTML rendering
- Server only exposed during brief auth window (security)
- Compatible with all OAuth providers (Google, GitHub, Auth0, Azure AD)

#### Go Implementation Example

Based on douglasmakey/oauth2-example + Wails context:

```go
package auth

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"

    "github.com/wailsapp/wails/v2/pkg/runtime"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
)

type AuthService struct {
    ctx        context.Context
    config     *oauth2.Config
    server     *http.Server
    tokenChan  chan *oauth2.Token
    errChan    chan error
}

func NewAuthService(ctx context.Context, clientID, clientSecret string) *AuthService {
    return &AuthService{
        ctx: ctx,
        config: &oauth2.Config{
            ClientID:     clientID,
            ClientSecret: clientSecret,
            RedirectURL:  "http://localhost:9999/callback",
            Scopes: []string{
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/drive.file",
            },
            Endpoint: google.Endpoint,
        },
        tokenChan: make(chan *oauth2.Token, 1),
        errChan:   make(chan error, 1),
    }
}

func (a *AuthService) SignInWithGoogle() (*oauth2.Token, error) {
    // Generate PKCE verifier/challenge
    verifier, err := generateCodeVerifier()
    if err != nil {
        return nil, err
    }
    challenge := generateCodeChallenge(verifier)

    // Start temporary HTTP server
    mux := http.NewServeMux()
    mux.HandleFunc("/callback", a.handleCallback(verifier))

    a.server = &http.Server{
        Addr:    ":9999",
        Handler: mux,
    }

    go func() {
        if err := a.server.ListenAndServe(); err != http.ErrServerClosed {
            a.errChan <- err
        }
    }()

    // Open browser to Google OAuth (with PKCE + offline access)
    authURL := a.config.AuthCodeURL("state-token",
        oauth2.AccessTypeOffline,              // Get refresh token
        oauth2.SetAuthURLParam("prompt", "consent"),
        oauth2.SetAuthURLParam("code_challenge", challenge),
        oauth2.SetAuthURLParam("code_challenge_method", "S256"),
    )
    runtime.BrowserOpenURL(a.ctx, authURL)

    // Wait for callback or timeout
    select {
    case token := <-a.tokenChan:
        a.shutdownServer()
        return token, nil
    case err := <-a.errChan:
        a.shutdownServer()
        return nil, err
    case <-time.After(5 * time.Minute):
        a.shutdownServer()
        return nil, fmt.Errorf("auth timeout")
    }
}

func (a *AuthService) handleCallback(verifier string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Validate state (CSRF protection)
        if r.URL.Query().Get("state") != "state-token" {
            a.errChan <- fmt.Errorf("invalid state parameter")
            http.Error(w, "Invalid state", http.StatusBadRequest)
            return
        }

        // Exchange code for token (includes verifier for PKCE)
        code := r.URL.Query().Get("code")
        token, err := a.config.Exchange(context.Background(), code,
            oauth2.SetAuthURLParam("code_verifier", verifier),
        )
        if err != nil {
            a.errChan <- err
            http.Error(w, "Token exchange failed", http.StatusInternalServerError)
            return
        }

        // Send success response to browser
        w.Write([]byte("<html><body><h1>Authentication successful!</h1><p>You can close this window.</p></body></html>"))

        // Send token to main flow
        a.tokenChan <- token
    }
}

func (a *AuthService) shutdownServer() {
    if a.server != nil {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        a.server.Shutdown(ctx)
    }
}
```

**Integration with Wails App:**

```go
// backend/internal/app/app.go
type App struct {
    ctx         context.Context
    authService *auth.AuthService
}

func (a *App) GoogleSignIn() error {
    token, err := a.authService.SignInWithGoogle()
    if err != nil {
        return err
    }

    // Exchange Google OAuth token for Supabase session
    supabaseClient := auth.New(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"))
    session, err := supabaseClient.SignInWithIdToken("google", token.Extra("id_token").(string), "", token.AccessToken, "")
    if err != nil {
        return err
    }

    // Store session + provider tokens securely
    return a.storeTokens(session, token)
}
```

#### Wails v3 OAuth Example

Wails v3 (alpha) includes official OAuth example at `github.com/wailsapp/wails/v3/examples/oauth`, but not production-ready (v3 requires Go 1.24+, still alpha).

---

### 5. Google OAuth for Drive API Access

#### Required Configuration

**1. Google Cloud Console Setup:**
- Create OAuth 2.0 Client ID (type: "Web application" for localhost callback)
- Authorized JavaScript origins: `http://localhost:9999`
- Authorized redirect URIs: `http://localhost:9999/callback`
- Enable Google Drive API in APIs & Services

**2. Required Scopes:**

```go
config := &oauth2.Config{
    Scopes: []string{
        // Supabase Auth requires
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",

        // Drive API access
        "https://www.googleapis.com/auth/drive.file",          // Per-file access
        // OR
        "https://www.googleapis.com/auth/drive",               // Full Drive access
    },
}
```

**3. Getting Refresh Tokens:**

Google doesn't send refresh tokens by default. **Critical parameters:**

```go
authURL := config.AuthCodeURL("state",
    oauth2.AccessTypeOffline,              // REQUIRED for refresh token
    oauth2.SetAuthURLParam("prompt", "consent"), // Force consent screen (re-shows permissions)
)
```

**Without these parameters:** Second auth won't return refresh token (user not shown privileges, no re-consent).

#### Extracting Provider Tokens from Supabase Session

**JavaScript SDK Pattern (reference):**
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})

// After callback: exchangeCodeForSession() returns session
const session = data.session
const googleAccessToken = session.provider_token         // For Drive API
const googleRefreshToken = session.provider_refresh_token
```

**Go Implementation Gap:**

supabase-community/auth-go `TokenResponse` **does not include** `provider_token` or `provider_refresh_token` fields. Only returns Supabase's own access/refresh tokens.

**Workaround:** Use Google OAuth directly (as shown in section 4) to get Drive API tokens, then exchange Google ID token for Supabase session:

```go
// 1. Get Google tokens via OAuth2 flow
googleToken, err := googleConfig.Exchange(ctx, code)
// googleToken.AccessToken -> Use for Drive API
// googleToken.RefreshToken -> Store for offline access

// 2. Exchange Google ID token for Supabase session
idToken := googleToken.Extra("id_token").(string)
supabaseSession, err := supabaseClient.SignInWithIdToken("google", idToken, "", googleToken.AccessToken, "")

// 3. Store BOTH token sets
// - Supabase tokens: For auth state
// - Google tokens: For Drive API calls
```

#### Using Drive API with Tokens

```go
import (
    "golang.org/x/oauth2"
    "google.golang.org/api/drive/v3"
    "google.golang.org/api/option"
)

func createDriveClient(accessToken, refreshToken string, expiresAt time.Time) (*drive.Service, error) {
    config := &oauth2.Config{
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        Endpoint:     google.Endpoint,
    }

    token := &oauth2.Token{
        AccessToken:  accessToken,
        RefreshToken: refreshToken,
        Expiry:       expiresAt,
        TokenType:    "Bearer",
    }

    // Token auto-refresh handled by config.Client()
    httpClient := config.Client(context.Background(), token)

    driveService, err := drive.NewService(context.Background(), option.WithHTTPClient(httpClient))
    return driveService, err
}

// Usage
srv, err := createDriveClient(storedAccessToken, storedRefreshToken, storedExpiry)
files, err := srv.Files.List().PageSize(10).Do()
```

**Token Auto-Refresh:** `config.Client()` returns HTTP client that automatically refreshes expired tokens using refresh token.

---

### 6. Session Management & Token Refresh

#### Session Lifecycle

**Supabase Session Structure:**
- **Access Token (JWT):** Short-lived (default 1 hour), used for API requests
- **Refresh Token:** Long-lived (never expires), single-use (new refresh token issued on each refresh)
- **Expiry Time:** When access token expires
- **User Object:** User metadata

**Token Refresh Rules:**
- Refresh should occur at ~75% of token lifetime (45min for 1hr tokens)
- Each refresh consumes old refresh token, issues new access + refresh tokens
- Client libraries should refresh ahead of expiration (not possible if token lifetime < longest request duration)

#### Go Implementation (Manual Refresh)

supabase-go lacks auto-refresh; must implement own scheduler:

```go
package auth

import (
    "context"
    "sync"
    "time"

    "github.com/supabase-community/auth-go"
    "github.com/supabase-community/auth-go/types"
)

type SessionManager struct {
    mu            sync.RWMutex
    client        *auth.Client
    session       *types.TokenResponse
    refreshTicker *time.Ticker
    stopChan      chan struct{}
    onRefresh     func(*types.TokenResponse) // Callback to persist new session
}

func NewSessionManager(client *auth.Client, session *types.TokenResponse, onRefresh func(*types.TokenResponse)) *SessionManager {
    sm := &SessionManager{
        client:    client,
        session:   session,
        stopChan:  make(chan struct{}),
        onRefresh: onRefresh,
    }
    sm.startAutoRefresh()
    return sm
}

func (sm *SessionManager) startAutoRefresh() {
    // Refresh at 75% of token lifetime
    refreshInterval := time.Duration(sm.session.ExpiresIn*3/4) * time.Second
    sm.refreshTicker = time.NewTicker(refreshInterval)

    go func() {
        for {
            select {
            case <-sm.refreshTicker.C:
                if err := sm.refresh(); err != nil {
                    // Log error, retry with exponential backoff
                    sm.retryRefresh()
                }
            case <-sm.stopChan:
                sm.refreshTicker.Stop()
                return
            }
        }
    }()
}

func (sm *SessionManager) refresh() error {
    sm.mu.Lock()
    defer sm.mu.Unlock()

    newSession, err := sm.client.RefreshToken(sm.session.RefreshToken)
    if err != nil {
        return err
    }

    sm.session = newSession

    // Persist new session to storage
    if sm.onRefresh != nil {
        sm.onRefresh(newSession)
    }

    // Update ticker for new expiry time
    sm.refreshTicker.Reset(time.Duration(newSession.ExpiresIn*3/4) * time.Second)

    return nil
}

func (sm *SessionManager) retryRefresh() {
    backoff := 5 * time.Second
    maxRetries := 3

    for i := 0; i < maxRetries; i++ {
        time.Sleep(backoff)
        if err := sm.refresh(); err == nil {
            return
        }
        backoff *= 2 // Exponential backoff
    }

    // All retries failed - user needs to re-authenticate
    sm.Stop()
    // Trigger re-login flow in app
}

func (sm *SessionManager) GetSession() *types.TokenResponse {
    sm.mu.RLock()
    defer sm.mu.RUnlock()
    return sm.session
}

func (sm *SessionManager) Stop() {
    close(sm.stopChan)
}
```

**Usage in Wails App:**

```go
// After successful login
sessionManager := auth.NewSessionManager(supabaseClient, session, func(newSession *types.TokenResponse) {
    // Persist to secure storage
    storage.SaveSession(newSession)
})

// Get current session for API calls
currentSession := sessionManager.GetSession()
apiClient := api.NewClient(currentSession.AccessToken)

// On app shutdown
defer sessionManager.Stop()
```

#### JavaScript SDK Comparison

JS SDK provides automatic refresh via `auth.startAutoRefresh()` and `auth.stopAutoRefresh()`. Go equivalent must be manually implemented as shown above.

---

### 7. Secure Token Storage (Cross-Platform)

#### Platform-Specific Storage Systems

| Platform | System | Go Library Access |
|----------|--------|-------------------|
| macOS | Keychain | `99designs/keyring`, `zalando/go-keyring` |
| Windows | Credential Manager | `99designs/keyring`, `zalando/go-keyring` |
| Linux | Secret Service (Gnome Keyring) | `99designs/keyring`, `zalando/go-keyring` |

#### Recommended: 99designs/keyring

**Why:** Most comprehensive backend support, production-tested (AWS Vault), encrypted file fallback.

**Installation:**
```bash
go get github.com/99designs/keyring
```

**Implementation:**

```go
package storage

import (
    "encoding/json"
    "github.com/99designs/keyring"
    "github.com/supabase-community/auth-go/types"
)

type SecureStorage struct {
    ring keyring.Keyring
}

func NewSecureStorage(appName string) (*SecureStorage, error) {
    ring, err := keyring.Open(keyring.Config{
        ServiceName:              appName,
        KeychainName:             appName,                  // macOS
        KeychainTrustApplication: true,                     // Don't prompt on every access
        FileDir:                  "~/.config/" + appName,   // Fallback encrypted file
        FilePasswordFunc:         keyring.FixedPassphrase("your-secure-passphrase"),

        // Prefer system keychains, fall back to encrypted file
        AllowedBackends: []keyring.BackendType{
            keyring.KeychainBackend,      // macOS
            keyring.WinCredBackend,       // Windows
            keyring.SecretServiceBackend, // Linux
            keyring.FileBackend,          // Fallback
        },
    })

    if err != nil {
        return nil, err
    }

    return &SecureStorage{ring: ring}, nil
}

func (s *SecureStorage) SaveSession(session *types.TokenResponse) error {
    data, err := json.Marshal(session)
    if err != nil {
        return err
    }

    return s.ring.Set(keyring.Item{
        Key:  "supabase_session",
        Data: data,
    })
}

func (s *SecureStorage) LoadSession() (*types.TokenResponse, error) {
    item, err := s.ring.Get("supabase_session")
    if err != nil {
        return nil, err
    }

    var session types.TokenResponse
    err = json.Unmarshal(item.Data, &session)
    return &session, err
}

func (s *SecureStorage) SaveGoogleTokens(accessToken, refreshToken string, expiry time.Time) error {
    tokens := map[string]interface{}{
        "access_token":  accessToken,
        "refresh_token": refreshToken,
        "expiry":        expiry,
    }

    data, _ := json.Marshal(tokens)
    return s.ring.Set(keyring.Item{
        Key:  "google_oauth_tokens",
        Data: data,
    })
}

func (s *SecureStorage) LoadGoogleTokens() (accessToken, refreshToken string, expiry time.Time, err error) {
    item, err := s.ring.Get("google_oauth_tokens")
    if err != nil {
        return "", "", time.Time{}, err
    }

    var tokens map[string]interface{}
    json.Unmarshal(item.Data, &tokens)

    return tokens["access_token"].(string),
           tokens["refresh_token"].(string),
           tokens["expiry"].(time.Time),
           nil
}

func (s *SecureStorage) DeleteSession() error {
    s.ring.Remove("supabase_session")
    s.ring.Remove("google_oauth_tokens")
    return nil
}
```

**Security Considerations:**

- **macOS:** Keychain encrypts with user login credentials; prompts if unauthorized app accesses (set `KeychainTrustApplication: true` to whitelist)
- **Windows:** Credential Manager encrypts with user credentials; no cross-app protection (same user's apps can access)
- **Linux:** Secret Service encrypts with keyring-specific password; no cross-app protection
- **File Backend:** AES-256 encryption with passphrase; use strong passphrase (not hardcoded in production)

**Best Practice:** Store file passphrase in environment variable or derive from hardware identifier.

#### Alternative: zalando/go-keyring

Simpler API but uses `exec.Command()` on macOS (less efficient than native APIs):

```go
import "github.com/zalando/go-keyring"

// Save
keyring.Set("fuknotion", "session", sessionJSON)

// Load
sessionJSON, err := keyring.Get("fuknotion", "session")

// Delete
keyring.Delete("fuknotion", "session")
```

**Limitation:** No encrypted file fallback; fails if system keyring unavailable.

---

### 8. Offline Mode & Local-First Sync

#### Supabase Auth Offline Limitations

**Key Finding:** Supabase Auth requires network connectivity for:
- Initial authentication (OAuth flow)
- Token refresh (API call to Supabase servers)
- Session validation (JWT verification can be local if you cache public key)

**Offline Capability:** Once authenticated, access tokens work offline until expiry (default 1hr). After expiry, requires network to refresh.

#### Local-First Database Sync Solutions

For offline-first desktop apps, Supabase Auth alone insufficient. Need separate sync layer:

**1. PowerSync (Recommended for Production)**

**What:** Postgres-SQLite sync layer with offline-first architecture
**How:** Streams changes from Supabase Postgres → local SQLite; queues local writes → syncs when online
**Repo:** https://www.powersync.com

**Features:**
- Non-invasive (no Supabase schema changes)
- Real-time sync via Supabase Realtime (logical replication)
- Conflict resolution (last-write-wins or custom)
- Platform support: Flutter, React Native, Kotlin, Swift (no direct Go SDK)

**Limitation:** No official Go SDK; would need to implement sync protocol manually.

**2. RxDB Supabase Replication**

**What:** Two-way sync between RxDB (in-app NoSQL) and Supabase Postgres
**How:** PostgREST for pull/push, Supabase Realtime for live updates
**Platform:** JavaScript/TypeScript (React, Electron)

**Go Relevance:** Could use in Wails React frontend with Wails bindings to Go backend for file storage.

**3. Manual Implementation (For Fuknotion)**

Given Fuknotion uses SQLite + markdown files, custom sync approach:

**Architecture:**
```
Local Storage:
├── user.db (auth state, workspace metadata)
└── workspaces/
    ├── ws-{id}.db (CRDT for collaboration)
    └── notes/{note-id}.md (content)

Sync Strategy:
1. Auth: Supabase Auth for user identity
2. Storage: Google Drive API for markdown file sync
3. Metadata: Supabase Postgres for workspace listings
4. Offline: SQLite as source of truth
```

**Offline Auth Strategy:**
- Store Supabase session in keyring (valid ~1hr offline)
- Store Google OAuth tokens in keyring (refresh_token valid indefinitely)
- On network restore: Refresh Supabase session, sync Drive files

**Implementation Notes:**
- Don't rely on Supabase Postgres for note content (use Drive as blob storage)
- Use Supabase for user profiles, workspace metadata, sharing permissions
- Sync markdown files to Drive using Google Drive API (see section 5)

---

## Comparative Analysis

### Go SDK Options

| Feature | supabase-community/auth-go | nedpals/supabase-go | Direct OAuth2 + Supabase API |
|---------|---------------------------|---------------------|------------------------------|
| PKCE Support | ✅ Via `Token()` | ✅ Via `ExchangeCode()` | ✅ Manual implementation |
| Auto-Refresh | ❌ | ❌ | ❌ (implement own) |
| Provider Tokens | ❌ Not exposed | ❌ Not exposed | ✅ Full control |
| Production Ready | ❌ Pre-release | ❌ Unofficial | ⚠️ Manual effort |
| Database/Storage | ❌ Auth only | ✅ Full SDK | ❌ Separate libraries |
| Maintenance | Community | Individual | Self |

**Verdict:** For Fuknotion (Go + Drive sync), **Direct OAuth2** likely better:
- Get Google tokens directly (needed for Drive API)
- Exchange Google ID token for Supabase session (simple HTTP call)
- Avoid dependency on unmaintained SDK
- Full control over token lifecycle

### Token Storage Options

| Library | macOS | Windows | Linux | Fallback | Complexity |
|---------|-------|---------|-------|----------|------------|
| 99designs/keyring | Keychain (native) | Credential Manager | Secret Service | Encrypted file | Medium |
| zalando/go-keyring | Keychain (shell) | Credential Manager | Secret Service | ❌ None | Low |
| Manual file storage | ❌ | ❌ | ❌ | ✅ Only option | High (encryption) |

**Verdict:** **99designs/keyring** for production (robust, battle-tested, fallback support).

---

## Implementation Recommendations

### For Fuknotion Desktop App

**Phase 1: Authentication (Week 1-2)**

1. **Google OAuth with PKCE:**
   - Use `golang.org/x/oauth2` + `matthewhartstonge/pkce`
   - Localhost callback server (port 9999)
   - Scopes: `openid`, `userinfo.email`, `userinfo.profile`, `drive.file`
   - Parameters: `access_type=offline`, `prompt=consent`

2. **Supabase Session Exchange:**
   - Extract Google ID token from OAuth response
   - Call Supabase Auth API directly (simple HTTP POST):
     ```go
     POST https://{project}.supabase.co/auth/v1/token
     {
       "grant_type": "id_token",
       "provider": "google",
       "id_token": "<google_id_token>",
       "access_token": "<google_access_token>"
     }
     ```
   - Parse response to get Supabase access/refresh tokens

3. **Token Storage:**
   - Use `99designs/keyring` for cross-platform secure storage
   - Store separately:
     - `supabase_session` → Supabase tokens
     - `google_oauth` → Google tokens (for Drive API)

**Phase 2: Session Management (Week 2-3)**

1. **Auto-Refresh Implementation:**
   - SessionManager with ticker-based refresh (see section 6 code)
   - Exponential backoff on failures
   - Persist new tokens on each refresh

2. **App Startup:**
   ```go
   func (a *App) startup(ctx context.Context) {
       // Load stored session
       session, err := a.storage.LoadSession()
       if err != nil || a.isTokenExpired(session) {
           // Trigger re-login
           return
       }

       // Start auto-refresh
       a.sessionManager = NewSessionManager(supabaseClient, session, a.storage.SaveSession)

       // Initialize Drive client with Google tokens
       googleTokens, _ := a.storage.LoadGoogleTokens()
       a.driveService = createDriveClient(googleTokens)
   }
   ```

3. **Offline Handling:**
   - Allow read-only access to local markdown files when offline
   - Queue write operations for sync when online
   - Show "offline mode" indicator in UI

**Phase 3: Drive Sync (Week 4-5)**

1. **Upload/Download:**
   - Use `google.golang.org/api/drive/v3`
   - Store Drive file IDs in SQLite metadata
   - Implement conflict resolution (last-write-wins or manual)

2. **Token Refresh for Drive:**
   - `config.Client()` handles auto-refresh for Drive API calls
   - Update stored Google tokens when refreshed

**Phase 4: Production Hardening (Week 6)**

1. **Error Handling:**
   - Revoked tokens → force re-login
   - Network errors → retry with backoff
   - Invalid sessions → clear storage, restart auth

2. **Security:**
   - Never log tokens
   - Clear tokens on logout
   - Validate JWT signatures locally (cache Supabase public key)

3. **Testing:**
   - Mock OAuth server for unit tests
   - Test offline mode (disconnect network)
   - Test token expiry/refresh flows

### Quick Start Guide (Minimal Auth Flow)

```go
// 1. Install dependencies
// go get golang.org/x/oauth2 golang.org/x/oauth2/google
// go get github.com/matthewhartstonge/pkce
// go get github.com/99designs/keyring

// 2. Setup OAuth config
config := &oauth2.Config{
    ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
    ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
    RedirectURL:  "http://localhost:9999/callback",
    Scopes:       []string{"openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"},
    Endpoint:     google.Endpoint,
}

// 3. Start auth flow
verifier, _ := pkce.GenerateCodeVerifier(128)
challenge, _ := pkce.GenerateCodeChallenge(pkce.S256, verifier)

authURL := config.AuthCodeURL("state",
    oauth2.AccessTypeOffline,
    oauth2.SetAuthURLParam("prompt", "consent"),
    oauth2.SetAuthURLParam("code_challenge", challenge),
    oauth2.SetAuthURLParam("code_challenge_method", "S256"),
)
runtime.BrowserOpenURL(ctx, authURL)

// 4. Handle callback (in HTTP server)
token, _ := config.Exchange(ctx, code, oauth2.SetAuthURLParam("code_verifier", verifier))

// 5. Exchange for Supabase session
idToken := token.Extra("id_token").(string)
supabaseSession := exchangeIDTokenForSession(idToken, token.AccessToken)

// 6. Store tokens
storage.SaveSession(supabaseSession)
storage.SaveGoogleTokens(token.AccessToken, token.RefreshToken, token.Expiry)
```

### Code Examples

See Section 4 (Wails OAuth), Section 5 (Drive API), Section 6 (Session Manager), Section 7 (Secure Storage) for complete implementations.

### Common Pitfalls

1. **Missing `access_type=offline`** → No Google refresh token → Can't access Drive after 1hr
2. **Not storing `code_verifier`** → Token exchange fails with "invalid code verifier"
3. **Forgetting `prompt=consent`** → Second auth doesn't return refresh token
4. **Hardcoding file passphrase** → Security vulnerability; use env var or derive from system
5. **Using JS SDK patterns in Go** → Go SDK lacks feature parity; manual implementation needed
6. **Storing tokens in plaintext** → Use keyring; never save to unencrypted files
7. **Not handling token refresh failures** → App becomes unusable after 1hr; implement retry logic
8. **Assuming Supabase works offline** → It doesn't; design for intermittent connectivity

---

## Resources & References

### Official Documentation

- [Supabase Auth PKCE Flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Auth Sessions](https://supabase.com/docs/guides/auth/sessions)
- [Google OAuth 2.0 Web Server Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Drive API Go Quickstart](https://developers.google.com/drive/api/quickstart/go)
- [OAuth 2.0 PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)

### Go Packages

- [supabase-community/auth-go](https://github.com/supabase-community/auth-go) - Supabase Auth Go client
- [nedpals/supabase-go](https://github.com/nedpals/supabase-go) - Unofficial full SDK
- [golang.org/x/oauth2](https://pkg.go.dev/golang.org/x/oauth2) - Official OAuth2 library
- [matthewhartstonge/pkce](https://pkg.go.dev/github.com/matthewhartstonge/pkce) - PKCE implementation
- [99designs/keyring](https://pkg.go.dev/github.com/99designs/keyring) - Secure credential storage
- [zalando/go-keyring](https://pkg.go.dev/github.com/zalando/go-keyring) - Simpler keyring wrapper

### Code Examples

- [douglasmakey/oauth2-example](https://github.com/douglasmakey/oauth2-example) - OAuth2 with Google in Go
- [Wails OAuth Discussion #392](https://github.com/wailsapp/wails/issues/392) - Desktop OAuth patterns
- [Wails v3 OAuth Example](https://pkg.go.dev/github.com/wailsapp/wails/v3/examples/oauth) - Official example (alpha)

### Community Resources

- [Supabase Discord](https://discord.supabase.com) - Active community, #help-go channel
- [Wails Discord](https://discord.gg/wails) - Desktop app development support
- [Stack Overflow: supabase-go](https://stackoverflow.com/questions/tagged/supabase+go) - Q&A

### Third-Party Sync Solutions

- [PowerSync](https://www.powersync.com) - Postgres-SQLite sync for offline-first
- [RxDB Supabase Plugin](https://rxdb.info/replication-supabase.html) - JavaScript database sync

### Further Reading

- [Supabase Auth Architecture](https://supabase.com/docs/guides/auth/architecture)
- [Securing OAuth 2.0 with PKCE (Medium)](https://medium.com/@sanhdoan/securing-your-oauth-2-0-flow-with-pkce-a-practical-guide-with-go-4cd5ec72044b)
- [Building Desktop Apps with Wails (Medium)](https://medium.com/@pliutau/building-a-desktop-app-in-go-using-wails-756c1f31f75)
- [Cross-Platform Keyring in Go (Medium)](https://robinbohrer.medium.com/building-a-cross-platform-secure-api-key-manager-in-go-c86a4147db73)

---

## Appendices

### A. Glossary

- **PKCE:** Proof Key for Code Exchange - OAuth 2.0 extension preventing auth code interception
- **Code Verifier:** Random 43-128 char string, cryptographically secure, stored client-side
- **Code Challenge:** SHA256 hash of verifier, base64url-encoded, sent to auth provider
- **Auth Code:** Temporary code (5min validity) from OAuth provider, exchanged for tokens
- **Access Token:** JWT for API authentication, short-lived (default 1hr)
- **Refresh Token:** Long-lived token for getting new access tokens, single-use
- **Provider Token:** OAuth provider's own access token (e.g., Google's for Drive API)
- **ID Token:** JWT containing user identity info, used for SSO
- **JWT:** JSON Web Token - signed JSON payload for stateless auth
- **CSRF:** Cross-Site Request Forgery - prevented by state parameter validation
- **Keyring:** OS-level secure credential storage (Keychain/Credential Manager/Secret Service)

### B. Supabase Session Token Structure

```json
{
  "access_token": "eyJhbGc...",  // JWT for Supabase API auth
  "token_type": "bearer",
  "expires_in": 3600,             // Seconds until access token expiry
  "expires_at": 1699564800,       // Unix timestamp of expiry
  "refresh_token": "v1.MR5d...",  // Single-use refresh token
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "app_metadata": { "provider": "google" },
    "user_metadata": { "name": "User Name" }
  }
}
```

**Note:** Go SDK returns `types.TokenResponse` with these fields (but missing `provider_token`).

### C. Google OAuth Token Structure

```json
{
  "access_token": "ya29.a0Ae...",    // For Drive API calls
  "token_type": "Bearer",
  "expires_in": 3599,                 // Seconds
  "refresh_token": "1//0gX...",       // Only if access_type=offline
  "scope": "openid email profile ...",
  "id_token": "eyJhbGc..."            // JWT with user identity
}
```

**Access via Go:**
```go
token.AccessToken  // string
token.RefreshToken // string
token.Expiry       // time.Time
token.Extra("id_token") // interface{} (cast to string)
```

### D. Environment Variables

```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# Supabase (from Supabase Dashboard > Settings > API)
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...  # Public key for client-side

# Optional: Service role key (NEVER expose client-side)
SUPABASE_SERVICE_KEY=eyJhbGc...  # For admin operations
```

### E. Google Cloud Console Checklist

1. ✅ Create OAuth 2.0 Client ID (Credentials > Create > OAuth client ID)
2. ✅ Application type: Web application
3. ✅ Authorized JavaScript origins: `http://localhost:9999`
4. ✅ Authorized redirect URIs: `http://localhost:9999/callback`
5. ✅ Enable APIs: Google Drive API, Google+ API (for userinfo)
6. ✅ OAuth consent screen: Add test users (for development)
7. ✅ Scopes: Add `drive.file` or `drive` if not default
8. ✅ Download credentials JSON → Extract client ID/secret

### F. Supabase Dashboard Checklist

1. ✅ Enable Google OAuth (Authentication > Providers > Google)
2. ✅ Paste Google Client ID + Secret
3. ✅ Add redirect URL: `http://localhost:9999/callback` (for testing)
4. ✅ Additional scopes: `https://www.googleapis.com/auth/drive.file`
5. ✅ Skip nonce: Enable (simplifies ID token validation)
6. ✅ Auth settings: Set JWT expiry (default 3600s)
7. ✅ (Optional) Custom access token hook: For adding claims

---

## Unresolved Questions

1. **Provider token extraction:** supabase-community/auth-go doesn't expose `provider_token` or `provider_refresh_token` in `TokenResponse`. Workaround confirmed (direct OAuth + ID token exchange), but SDK improvement pending.

2. **Wails v3 OAuth example:** Official example exists but not production-ready (v3 alpha, Go 1.24+ required). Need to track v3 stable release timeline.

3. **PowerSync Go SDK:** No official Go SDK for PowerSync. Manual protocol implementation feasible but undocumented. Contact PowerSync team for roadmap.

4. **Supabase Go SDK maintenance:** supabase-community/supabase-go shows "pre-release" warning. No public roadmap for v1.0. Consider community fork or direct API usage.

5. **Keyring file backend passphrase:** Best practice for deriving passphrase in desktop apps (hardware ID? User input? TPM?). Security audit needed.

6. **Offline JWT validation:** Can validate Supabase JWTs offline if public key cached. Need to document public key retrieval + caching strategy.

7. **CRDT implementation:** README mentions "CR-SQLite extension" for workspace CRDT. Research CR-SQLite Go bindings + Supabase Realtime integration.

8. **Google OAuth desktop client type:** Research mentions "Web application" type for OAuth client. Google also has "Desktop app" type - explore differences for production deployment.

---

**Research completed:** 2025-11-05 16:45 UTC
**Next steps:** Review findings, update phase-03-authentication.md plan, begin implementation phase 1 (auth flow)
