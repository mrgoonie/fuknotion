# Fuknotion Development Script for Windows
# This script sets up the environment and runs the app in development mode

Write-Host "Starting Fuknotion in development mode..." -ForegroundColor Green

# Load .env file and set environment variables
if (Test-Path ".env") {
    Write-Host "Loading .env file..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -and -not $name.StartsWith('#')) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "  Set $name" -ForegroundColor Gray
            }
        }
    }
    Write-Host ".env loaded successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found" -ForegroundColor Red
}

# Note: Using pure Go SQLite (modernc.org/sqlite), CGO not required
Write-Host "Using pure Go SQLite (no CGO required)" -ForegroundColor Yellow

Write-Host ""
Write-Host "Checking OAuth credentials..." -ForegroundColor Cyan

# Verify OAuth credentials
if ($env:GOOGLE_CLIENT_ID) {
    Write-Host "[OK] GOOGLE_CLIENT_ID is set" -ForegroundColor Green
} else {
    Write-Host "[ERROR] GOOGLE_CLIENT_ID not found in .env" -ForegroundColor Red
}

if ($env:GOOGLE_CLIENT_SECRET) {
    Write-Host "[OK] GOOGLE_CLIENT_SECRET is set" -ForegroundColor Green
} else {
    Write-Host "[ERROR] GOOGLE_CLIENT_SECRET not found in .env" -ForegroundColor Red
}

Write-Host ""
Write-Host "Starting Wails..." -ForegroundColor Green
Write-Host ""
wails dev
