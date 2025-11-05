#!/bin/bash
# Fuknotion Development Script for macOS/Linux
# This script sets up the environment and runs the app in development mode

echo "Starting Fuknotion in development mode..."

# Load .env file and export environment variables
if [ -f ".env" ]; then
    echo "Loading .env file..."

    # Export variables from .env
    set -a
    source .env
    set +a

    echo ".env loaded successfully"
else
    echo "Warning: .env file not found"
fi

# Note: Using pure Go SQLite (modernc.org/sqlite), CGO not required
echo "Using pure Go SQLite (no CGO required)"

# Verify OAuth credentials
echo ""
echo "Checking OAuth credentials..."
if [ -n "$GOOGLE_CLIENT_ID" ]; then
    echo "[OK] GOOGLE_CLIENT_ID is set"
else
    echo "[ERROR] GOOGLE_CLIENT_ID not found in .env"
fi

if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "[OK] GOOGLE_CLIENT_SECRET is set"
else
    echo "[ERROR] GOOGLE_CLIENT_SECRET not found in .env"
fi

echo ""
echo "Starting Wails..."
echo ""

wails dev
