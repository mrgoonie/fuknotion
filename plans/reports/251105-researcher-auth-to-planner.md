# Research Report: Authentication for Desktop Apps

**From:** researcher-auth
**To:** planner
**Date:** 2025-11-05
**Topic:** Authentication strategies (Email, GitHub, Google) for desktop apps

## Executive Summary

Desktop auth requires OAuth 2.0 desktop flow (browser-based) since webview cookies unreliable. Google mandates OAuth for Drive access (Jan 2025+). Use PKCE flow for security. Store tokens in OS keychain. Recommend: Auth0 or Supabase for multi-provider support OR direct OAuth implementation.

## Desktop Authentication Challenges

**Webview Limitations:**
- Wails native webview doesn't support cookies reliably
- Can't use traditional session cookies
- OAuth redirect more secure anyway

**Security Concerns:**
- Client secret can't be embedded (reverse-engineerable)
- PKCE (Proof Key for Code Exchange) required
- Refresh token storage must be secure

**User Experience:**
- Must open system browser (not webview)
- Redirect to localhost callback
- Seamless token refresh

## OAuth 2.0 Desktop Flow

### Standard Flow (with PKCE)

```
1. App generates code_verifier (random string)
2. Creates code_challenge = SHA256(code_verifier)
3. Opens browser to provider's auth URL
   ?client_id=xxx
   &redirect_uri=http://localhost:8080/callback
   &response_type=code
   &scope=email profile
   &code_challenge=xxx
   &code_challenge_method=S256
4. User authenticates in browser
5. Provider redirects to localhost:8080/callback?code=xxx
6. App exchanges code for tokens:
   POST /token
   code=xxx
   code_verifier=xxx (proves it's same app)
   redirect_uri=http://localhost:8080/callback
7. Receive access_token + refresh_token
8. Store refresh_token in OS keychain
9. Close browser window
```

### Security: PKCE

**Why PKCE?**
- Prevents authorization code interception
- No client_secret needed (safe for desktop apps)
- Required by Google (2025+)

**Code Verifier:**
```go
verifier := generateRandomString(128)
challenge := base64URL(sha256(verifier))
```

**Token Exchange:**
```go
// Send code_verifier with code
// Server validates: sha256(verifier) == challenge
```

## Provider-Specific Implementation

### 1. Google OAuth

**Key Changes (2025):**
- Less secure apps disabled March 14, 2025
- OAuth mandatory for Gmail, Calendar, Drive
- PKCE required

**Setup:**
1. Google Cloud Console → Create OAuth 2.0 Client ID
2. Application type: Desktop app
3. Redirect URI: `http://localhost:8080/callback`
4. Scopes needed:
   - `openid` (authentication)
   - `email` (user email)
   - `profile` (user info)
   - `https://www.googleapis.com/auth/drive.file` (Drive access)

**Authorization URL:**
```
https://accounts.google.com/o/oauth2/v2/auth
?client_id={CLIENT_ID}
&redirect_uri=http://localhost:8080/callback
&response_type=code
&scope=openid email profile https://www.googleapis.com/auth/drive.file
&access_type=offline  # Get refresh_token
&code_challenge={CHALLENGE}
&code_challenge_method=S256
```

**Token Exchange:**
```
POST https://oauth2.googleapis.com/token
client_id={CLIENT_ID}
code={AUTH_CODE}
redirect_uri=http://localhost:8080/callback
grant_type=authorization_code
code_verifier={VERIFIER}
```

**Response:**
```json
{
  "access_token": "ya29.xxx",
  "refresh_token": "1//xxx",
  "expires_in": 3600,
  "scope": "openid email profile ...",
  "token_type": "Bearer",
  "id_token": "eyJxx..."
}
```

**Refresh Token:**
```
POST https://oauth2.googleapis.com/token
client_id={CLIENT_ID}
refresh_token={REFRESH_TOKEN}
grant_type=refresh_token
```

### 2. GitHub OAuth

**Setup:**
1. GitHub Settings → Developer Settings → OAuth Apps
2. Register new app
3. Callback URL: `http://localhost:8080/callback`

**Authorization URL:**
```
https://github.com/login/oauth/authorize
?client_id={CLIENT_ID}
&redirect_uri=http://localhost:8080/callback
&scope=user:email
&state={RANDOM_STATE}
```

**Token Exchange:**
```
POST https://github.com/login/oauth/access_token
client_id={CLIENT_ID}
client_secret={CLIENT_SECRET}  # Required for GitHub
code={AUTH_CODE}
redirect_uri=http://localhost:8080/callback
```

**Note:** GitHub requires client_secret even for desktop apps. Store in backend, not frontend.

**Alternative: Device Flow**
```
1. POST /login/device/code → device_code + user_code
2. Show user_code to user
3. User visits github.com/login/device
4. Enters user_code
5. App polls /login/oauth/access_token
6. Receives token when user authorizes
```

Better for desktop: no localhost server needed.

### 3. Email/Password (Passwordless)

**Options:**

**A. Magic Link:**
1. User enters email
2. Send email with one-time link
3. User clicks link → authenticate
4. App polls backend for token

**B. OTP (One-Time Password):**
1. User enters email
2. Send 6-digit code
3. User enters code in app
4. Exchange code for token

**C. Traditional Password:**
1. User enters email + password
2. POST to auth server
3. Receive tokens
4. Store refresh_token

**Recommendation:** Passwordless (magic link or OTP) for better UX + security.

## Token Storage

### OS Keychain Integration

**macOS:**
```go
import "github.com/keybase/go-keychain"

// Store
keychain.AddPassword(
    "Fuknotion",           // Service name
    "refresh_token",       // Account
    refreshToken,          // Token
)

// Retrieve
token, _ := keychain.GetPassword(
    "Fuknotion",
    "refresh_token",
)
```

**Windows:**
```go
import "github.com/danieljoos/wincred"

// Store
cred := wincred.NewGenericCredential("Fuknotion")
cred.CredentialBlob = []byte(refreshToken)
cred.Persist = wincred.PersistLocalMachine
cred.Write()

// Retrieve
cred, _ := wincred.GetGenericCredential("Fuknotion")
token := string(cred.CredentialBlob)
```

**Linux:**
```go
import "github.com/zalando/go-keyring"

// Store
keyring.Set("Fuknotion", "refresh_token", refreshToken)

// Retrieve
token, _ := keyring.Get("Fuknotion", "refresh_token")
```

**Cross-Platform Wrapper:**
```go
import "github.com/99designs/keyring"

kr, _ := keyring.Open(keyring.Config{
    ServiceName: "Fuknotion",
})

kr.Set(keyring.Item{
    Key:  "refresh_token",
    Data: []byte(refreshToken),
})

item, _ := kr.Get("refresh_token")
token := string(item.Data)
```

### Never Store in Plain Text

**Bad:**
```go
// DON'T DO THIS
os.WriteFile("~/.fuknotion/token", []byte(token), 0644)
```

**Good:**
```go
// Use OS keychain
keyring.Set("Fuknotion", "token", token)
```

## Architecture for Fuknotion

### Recommended: Auth0 or Supabase

**Why?**
- Handles multiple OAuth providers
- Passwordless built-in
- Token refresh automatic
- Secure by default
- Less code to maintain

**Auth0 Example:**
```go
import "github.com/auth0/go-jwt-middleware"

// 1. Open browser to Auth0
authURL := "https://fuknotion.auth0.com/authorize" +
    "?client_id=xxx" +
    "&redirect_uri=http://localhost:8080/callback" +
    "&response_type=code" +
    "&scope=openid profile email"

openBrowser(authURL)

// 2. Start local server
http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
    code := r.URL.Query().Get("code")

    // 3. Exchange code for tokens
    tokens := exchangeCodeForTokens(code)

    // 4. Store refresh_token
    keyring.Set("Fuknotion", "refresh_token", tokens.RefreshToken)

    // 5. Store user info
    saveUser(tokens.IDToken)

    w.Write([]byte("Success! You can close this window."))
})

http.ListenAndServe(":8080", nil)
```

### Alternative: Direct OAuth Implementation

**Pros:**
- No external dependency
- More control

**Cons:**
- More code to maintain
- Security burden on us

**Implementation:**
```go
type AuthManager struct {
    googleClient *oauth2.Config
    githubClient *oauth2.Config
}

func (a *AuthManager) LoginWithGoogle() error {
    // Generate PKCE
    verifier := generateVerifier()
    challenge := sha256Base64(verifier)

    // Build auth URL
    url := a.googleClient.AuthCodeURL("state",
        oauth2.SetAuthURLParam("code_challenge", challenge),
        oauth2.SetAuthURLParam("code_challenge_method", "S256"),
        oauth2.SetAuthURLParam("access_type", "offline"),
    )

    // Open browser
    openBrowser(url)

    // Start local server
    code := waitForCallback()

    // Exchange code
    token, _ := a.googleClient.Exchange(context.Background(), code,
        oauth2.SetAuthURLParam("code_verifier", verifier),
    )

    // Store tokens
    storeToken(token)

    return nil
}
```

## Token Refresh Strategy

**Access Token Lifespan:**
- Google: 1 hour
- GitHub: No expiration (but can be revoked)
- Auth0: Configurable (default 1 day)

**Refresh Strategy:**
```go
func (a *AuthManager) GetValidAccessToken() (string, error) {
    // Check if current token expired
    if time.Now().After(a.tokenExpiry) {
        // Refresh
        newToken, err := a.refreshAccessToken()
        if err != nil {
            // Refresh failed → re-authenticate
            return "", ErrNeedLogin
        }
        a.accessToken = newToken
    }

    return a.accessToken, nil
}

func (a *AuthManager) refreshAccessToken() (string, error) {
    refreshToken, _ := keyring.Get("Fuknotion", "refresh_token")

    resp, _ := http.Post(
        "https://oauth2.googleapis.com/token",
        "application/x-www-form-urlencoded",
        strings.NewReader(fmt.Sprintf(
            "client_id=%s&refresh_token=%s&grant_type=refresh_token",
            clientID, refreshToken,
        )),
    )

    var result struct {
        AccessToken string `json:"access_token"`
        ExpiresIn   int    `json:"expires_in"`
    }
    json.NewDecoder(resp.Body).Decode(&result)

    a.tokenExpiry = time.Now().Add(time.Duration(result.ExpiresIn) * time.Second)
    return result.AccessToken, nil
}
```

## Offline Mode Considerations

**Tokens Expire:**
- If offline > 1 hour, access_token expires
- Refresh requires network
- App can't access Drive while offline anyway

**User Experience:**
```go
if offline && tokenExpired {
    // Show: "You're offline. Changes will sync when reconnected."
    // Allow full app usage (local data)
    // Queue Drive operations
}
```

**Authentication State:**
- User stays "logged in" (refresh_token valid)
- Just can't sync until online
- Graceful degradation

## Multi-Account Support

**Use Case:**
- User has personal + work Google accounts
- Want separate workspaces per account

**Implementation:**
```go
type Account struct {
    ID           string
    Email        string
    Provider     string
    RefreshToken string
}

// Store multiple accounts
accounts := []Account{
    {ID: "1", Email: "personal@gmail.com"},
    {ID: "2", Email: "work@company.com"},
}

// Switch account
func (a *AuthManager) SwitchAccount(accountID string) {
    account := getAccount(accountID)
    a.currentAccount = account
    a.accessToken = "" // Will refresh on next use
}
```

## Recommendations for Fuknotion

1. **Use Auth0 or Supabase** (faster, more secure)
2. **Support Google + GitHub + Email** (covers most users)
3. **PKCE for OAuth** (required, secure)
4. **Store tokens in OS keychain** (never plain text)
5. **Automatic token refresh** (transparent to user)
6. **Graceful offline mode** (show status, queue operations)
7. **Multi-account support** (future-proof)

## References

- Google OAuth Desktop: https://developers.google.com/identity/protocols/oauth2/native-app
- GitHub OAuth: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
- Auth0 Desktop: https://auth0.com/docs/quickstart/native
- PKCE Spec: https://oauth.net/2/pkce/

## Unresolved Questions

- Should we use Auth0/Supabase or direct OAuth?
- Support multiple Google accounts simultaneously?
- How to handle refresh_token revocation (user changed password)?
