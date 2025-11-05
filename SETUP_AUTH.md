# Authentication Setup Guide

## Phase 03: Authentication - Setup Instructions

### Prerequisites

1. **Wails CLI installed**
   ```powershell
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

2. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing
   - Enable Google Drive API
   - Create OAuth 2.0 Client ID

### Step 1: Configure OAuth Credentials

**In Google Cloud Console:**

1. **Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Fuknotion Desktop`

2. **Add Authorized JavaScript origins:**
   ```
   http://localhost:9999
   ```

3. **Add Authorized redirect URIs:**
   ```
   http://localhost:9999/callback
   ```

4. **Required Scopes** (will be requested automatically):
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.file`

5. **Download credentials** or copy Client ID and Client Secret

### Step 2: Set Environment Variables

**Option A: Create `.env` file** (recommended)

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your credentials:
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Option B: Set in PowerShell** (temporary - current session only)

```powershell
$env:GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Option C: Set in System Environment Variables** (permanent - Windows)

1. Search for "Environment Variables" in Windows
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "User variables", click "New"
5. Add both variables

### Step 3: Build Frontend

```powershell
cd frontend
npm install
npm run build
cd ..
```

### Step 4: Run the App

```powershell
wails dev
```

This will:
- Compile the Go backend
- Start the frontend dev server
- Open the Fuknotion app window
- Enable hot reload for development

### Step 5: Test Authentication

1. **App should open showing the login screen**
   - Beautiful gradient background
   - "Continue with Google" button

2. **Click "Continue with Google"**
   - Your default browser will open
   - Google login page appears

3. **Sign in with Google**
   - Enter your Google credentials
   - Review and accept permissions

4. **Authorization successful**
   - Browser shows success page (auto-closes in 2 seconds)
   - App loads with your profile

5. **Verify token persistence**
   - Close the app
   - Run `wails dev` again
   - Should load directly without login (session restored)

### Troubleshooting

#### "wails: command not found"

**Solution:** Install Wails CLI

```powershell
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Add Go bin to PATH if not already
$env:PATH += ";$env:USERPROFILE\go\bin"
```

#### "authentication not configured"

**Solution:** Environment variables not set

```powershell
# Check if variables are set
echo $env:GOOGLE_CLIENT_ID
echo $env:GOOGLE_CLIENT_SECRET

# If empty, set them (see Step 2 above)
```

#### "redirect_uri_mismatch" error

**Solution:** Redirect URI not configured in Google Console

- Go to Google Cloud Console
- Edit your OAuth Client
- Add `http://localhost:9999/callback` to redirect URIs
- Save and try again

#### "failed to initialize secure storage"

**Solution:** Keyring access issue (rare)

- Windows: Run as administrator once to initialize Credential Manager
- Linux: Install `gnome-keyring` or `kwallet`
- Fallback: App will use encrypted file storage automatically

#### Port 9999 already in use

**Solution:** Kill the process using port 9999

```powershell
# Find process
netstat -ano | findstr :9999

# Kill process (replace PID with actual)
taskkill /PID <PID> /F
```

#### Browser doesn't open automatically

**Solution:** Manually open the auth URL

- Look in the terminal output for the auth URL
- Copy and paste into your browser
- Continue with login

### Security Notes

✅ **Tokens are stored securely:**
- Windows: Credential Manager
- macOS: Keychain
- Linux: Secret Service (GNOME Keyring)
- Fallback: AES-256 encrypted file

✅ **Tokens auto-refresh every 45 minutes**
- No manual intervention needed
- Exponential backoff retry on failure

✅ **PKCE prevents code interception**
- Industry-standard security (RFC 7636)
- No client secret exposed

### What's Working

- ✅ Google Sign In
- ✅ Token storage (secure)
- ✅ Auto-refresh
- ✅ Session persistence
- ✅ Logout
- ✅ User profile display

### What's Next

After authentication is working:

1. **Phase 12: Google Drive Sync**
   - File upload/download
   - CR-SQLite for metadata
   - Three-way merge for markdown
   - Background sync every 5 minutes

2. **Phase 16: Testing**
   - Unit tests
   - Integration tests
   - Security audit

### Need Help?

If you encounter issues not covered here:

1. Check console output for errors
2. Verify Google OAuth configuration
3. Ensure environment variables are set
4. Try running with `wails dev -debug` for verbose logging

---

**Created:** 2025-11-05
**Phase:** 03/17 - Authentication
**Status:** Implementation Complete, Testing Required
