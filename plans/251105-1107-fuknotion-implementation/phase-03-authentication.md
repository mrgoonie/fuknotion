# Phase 03: Authentication & User Management

**Phase:** 03/17 | **Duration:** 3 days | **Priority:** Critical | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 02 | **Next:** Phase 04
**Research:** `../reports/251105-researcher-auth-to-planner.md`

## Overview

Implement OAuth 2.0 with PKCE for Google/GitHub, email/password auth, token management in OS keychain, user profile management.

## Key Insights

- Google mandates OAuth for Drive (March 2025+)
- PKCE required for desktop apps (no client_secret)
- Open system browser for auth (webview cookies unreliable)
- Store refresh_token in OS keychain (never plain text)
- Access token expires 1hr, auto-refresh transparent

## Requirements

**Functional:**
- User login with Google/GitHub/Email
- OAuth flow in system browser
- Token refresh automatic
- User profile stored locally
- Logout clears sensitive data

**Non-Functional:**
- Auth completes under 10 seconds
- Tokens stored securely (OS keychain)
- Graceful offline mode (cached profile)

## Architecture

```go
// backend/internal/auth/manager.go
type AuthManager struct {
    googleConfig *oauth2.Config
    githubConfig *oauth2.Config
}
func (a *AuthManager) LoginWithGoogle() (User, error)
func (a *AuthManager) LoginWithGitHub() (User, error)
func (a *AuthManager) RefreshToken() (string, error)
func (a *AuthManager) Logout() error

// backend/internal/auth/keychain.go
func StoreToken(key, token string) error
func GetToken(key string) (string, error)
func DeleteToken(key string) error
```

## Related Files

**Create:**
- `backend/internal/auth/manager.go`
- `backend/internal/auth/keychain.go`
- `backend/internal/auth/oauth.go`
- `backend/internal/models/user.go`
- `frontend/src/stores/authStore.ts`
- `frontend/src/components/Auth/LoginScreen.tsx`

## Implementation Steps

1. **OAuth Config** - Google/GitHub client setup
2. **PKCE Implementation** - Code verifier/challenge
3. **Browser Flow** - Open browser, localhost callback
4. **Token Exchange** - Code → tokens
5. **Keychain Integration** - Cross-platform token storage
6. **User Profile** - Store in user.db
7. **Token Refresh** - Auto-refresh before expiry
8. **Login UI** - Provider buttons, email form
9. **Logout** - Clear tokens, profile

## Todo List

- [ ] Setup OAuth configs (Google, GitHub)
- [ ] Implement PKCE flow
- [ ] Create browser auth flow
- [ ] Integrate OS keychain (cross-platform)
- [ ] Implement token refresh
- [ ] Create user.db schema
- [ ] Build login UI
- [ ] Add logout functionality
- [ ] Test auth on all platforms
- [ ] Handle token expiry scenarios

## Success Criteria

- Login with Google/GitHub works
- Tokens stored in keychain
- Auto-refresh before expiry
- Offline mode uses cached profile
- Logout clears all sensitive data

## Risk Assessment

**Risk:** Keychain access denied
**Mitigation:** Fallback to encrypted local storage, warn user

**Risk:** OAuth redirect blocked
**Mitigation:** Use localhost with random port, fallback to device flow

## Security

- PKCE prevents code interception
- Tokens never in localStorage/sessionStorage
- Client credentials in backend only
- HTTPS for all OAuth requests

## Next Steps

Phase 04: Local SQLite Database Design
