# Development Scripts

Quick start scripts for running Fuknotion in development mode.

## Windows

```powershell
.\dev.ps1
```

## macOS / Linux

```bash
./dev.sh
```

## What These Scripts Do

1. **Load Environment Variables** - Automatically reads `.env` file and sets all variables
2. **Enable CGO** - Sets `CGO_ENABLED=1` (required for SQLite)
3. **Verify OAuth** - Checks that Google OAuth credentials are configured
4. **Run Wails** - Starts the app with `wails dev`

## Prerequisites

Before running the scripts, ensure you have:

1. **Wails CLI installed**
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

2. **`.env` file configured** with Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Frontend dependencies installed**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Troubleshooting

### Windows: "Execution Policy" Error

If you see an error about execution policies, run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS: "Permission Denied"

If you see a permission error, make the script executable:

```bash
chmod +x dev.sh
```

### Linux: Missing Dependencies

On Linux, you may need to install additional dependencies:

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libgtk-3-dev libwebkit2gtk-4.0-dev
```

**Fedora:**
```bash
sudo dnf install gtk3-devel webkit2gtk3-devel
```

**Arch:**
```bash
sudo pacman -S gtk3 webkit2gtk
```

### "Authentication not configured" Error

If you see this error in the app:

1. Verify `.env` file exists in the project root
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
3. Check the terminal output when running the script - it should show "✅ GOOGLE_CLIENT_ID is set"

### SQLite "CGO_ENABLED=0" Error

The scripts automatically set `CGO_ENABLED=1`. If you still see this error:

1. Ensure you have a C compiler installed:
   - **Windows**: Install MinGW-w64 or use Git Bash with gcc
   - **macOS**: Install Xcode Command Line Tools (`xcode-select --install`)
   - **Linux**: Install `build-essential` package

2. Verify CGO is enabled by checking the terminal output for "🔧 CGO_ENABLED=1"

## Manual Setup (Without Scripts)

If you prefer not to use the scripts, you can manually set up the environment:

**Windows (PowerShell):**
```powershell
$env:CGO_ENABLED="1"
$env:GOOGLE_CLIENT_ID="your-client-id"
$env:GOOGLE_CLIENT_SECRET="your-secret"
wails dev
```

**macOS/Linux (Bash/Zsh):**
```bash
export CGO_ENABLED=1
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-secret"
wails dev
```

## Production Build

To build the production executable:

**Windows:**
```powershell
$env:CGO_ENABLED="1"
wails build
```

**macOS/Linux:**
```bash
export CGO_ENABLED=1
wails build
```

The executable will be in `build/bin/`.

## See Also

- [SETUP_AUTH.md](./SETUP_AUTH.md) - Authentication setup guide
- [README.md](./README.md) - Project overview
- [Wails Documentation](https://wails.io/) - Wails framework docs
