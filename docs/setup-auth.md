# Authentication

🚀 Usage Instructions

1. Set up Google OAuth credentials:
# 1. Go to https://console.cloud.google.com/apis/credentials
# 2. Create OAuth 2.0 Client ID (Web application)
# 3. Add authorized origins: http://localhost:9999
# 4. Add redirect URIs: http://localhost:9999/callback
# 5. Enable Google Drive API

# 6. Copy .env.example to .env
cp .env.example .env

# 7. Fill in credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret