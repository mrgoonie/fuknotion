package sync

import (
	"context"
	"fmt"
	"io"
	"os"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// DriveSync handles Google Drive synchronization
type DriveSync struct {
	service        *drive.Service
	config         *oauth2.Config
	token          *oauth2.Token
	keyringStore   *KeyringStore
	loopbackServer *LoopbackServer
	pkceChallenge  *PKCEChallenge
}

// NewDriveSync creates a new Google Drive sync manager
func NewDriveSync() (*DriveSync, error) {
	// Initialize keyring store for secure token storage
	keyringStore, err := NewKeyringStore()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize keyring: %w", err)
	}

	// Initialize loopback server for OAuth callback
	loopbackServer := NewLoopbackServer()

	// OAuth2 configuration for Google Drive
	config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  loopbackServer.GetRedirectURL(),
		Scopes: []string{
			drive.DriveFileScope, // Access to files created by this app
		},
		Endpoint: google.Endpoint,
	}

	ds := &DriveSync{
		config:         config,
		keyringStore:   keyringStore,
		loopbackServer: loopbackServer,
	}

	// Try to load existing token from keyring
	if err := ds.LoadToken(); err == nil && ds.token != nil {
		// Token loaded, initialize service
		ctx := context.Background()
		if err := ds.initService(ctx); err != nil {
			// Token might be invalid, ignore error
		}
	}

	return ds, nil
}

// StartAuth initiates OAuth flow with PKCE and loopback server
func (ds *DriveSync) StartAuth() (string, error) {
	// Generate PKCE challenge
	pkce, err := GeneratePKCEChallenge()
	if err != nil {
		return "", fmt.Errorf("failed to generate PKCE: %w", err)
	}
	ds.pkceChallenge = pkce

	// Start loopback server
	if err := ds.loopbackServer.Start(); err != nil {
		return "", fmt.Errorf("failed to start callback server: %w", err)
	}

	// Build authorization URL with PKCE
	authURL := ds.config.AuthCodeURL(
		ds.loopbackServer.GetState(),
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("code_challenge", pkce.Challenge),
		oauth2.SetAuthURLParam("code_challenge_method", pkce.Method),
		oauth2.SetAuthURLParam("prompt", "consent"),
	)

	return authURL, nil
}

// GetAuthURL returns the OAuth2 authorization URL (deprecated - use StartAuth)
func (ds *DriveSync) GetAuthURL() string {
	url, _ := ds.StartAuth()
	return url
}

// WaitForAuth waits for OAuth callback and exchanges code for token
func (ds *DriveSync) WaitForAuth(ctx context.Context) error {
	// Wait for callback with 2-minute timeout
	code, err := ds.loopbackServer.WaitForCode(2 * time.Minute)
	if err != nil {
		ds.loopbackServer.Stop()
		return fmt.Errorf("failed to receive auth code: %w", err)
	}

	// Stop loopback server
	if err := ds.loopbackServer.Stop(); err != nil {
		return fmt.Errorf("failed to stop callback server: %w", err)
	}

	// Exchange code for token with PKCE verifier
	token, err := ds.config.Exchange(
		ctx,
		code,
		oauth2.SetAuthURLParam("code_verifier", ds.pkceChallenge.Verifier),
	)
	if err != nil {
		return fmt.Errorf("failed to exchange code: %w", err)
	}

	ds.token = token

	// Save token to keyring
	if err := ds.keyringStore.SaveToken(token); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	// Initialize Drive service
	if err := ds.initService(ctx); err != nil {
		return fmt.Errorf("failed to initialize service: %w", err)
	}

	return nil
}

// ExchangeCode exchanges an authorization code for an access token (deprecated - use WaitForAuth)
func (ds *DriveSync) ExchangeCode(ctx context.Context, code string) error {
	token, err := ds.config.Exchange(ctx, code)
	if err != nil {
		return fmt.Errorf("failed to exchange code: %w", err)
	}

	ds.token = token

	// Save token to keyring
	if err := ds.keyringStore.SaveToken(token); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	// Initialize Drive service
	if err := ds.initService(ctx); err != nil {
		return fmt.Errorf("failed to initialize service: %w", err)
	}

	return nil
}

// LoadToken loads a saved token from keyring
func (ds *DriveSync) LoadToken() error {
	token, err := ds.keyringStore.LoadToken()
	if err != nil {
		return fmt.Errorf("failed to load token: %w", err)
	}

	if token == nil {
		return fmt.Errorf("no token found")
	}

	ds.token = token
	return nil
}

// SignOut removes stored token and clears authentication
func (ds *DriveSync) SignOut() error {
	// Delete token from keyring
	if err := ds.keyringStore.DeleteToken(); err != nil {
		return fmt.Errorf("failed to delete token: %w", err)
	}

	// Clear in-memory token and service
	ds.token = nil
	ds.service = nil

	return nil
}

// initService initializes the Google Drive service
func (ds *DriveSync) initService(ctx context.Context) error {
	client := ds.config.Client(ctx, ds.token)
	service, err := drive.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return fmt.Errorf("failed to create drive service: %w", err)
	}

	ds.service = service
	return nil
}

// IsAuthenticated checks if the user is authenticated with Google Drive
func (ds *DriveSync) IsAuthenticated() bool {
	return ds.token != nil && ds.token.Valid()
}

// GetAccountInfo returns authenticated user's Google account information
func (ds *DriveSync) GetAccountInfo(ctx context.Context) (map[string]interface{}, error) {
	if !ds.IsAuthenticated() {
		return nil, fmt.Errorf("not authenticated")
	}

	// Get user info from Drive API
	about, err := ds.service.About.Get().
		Context(ctx).
		Fields("user(displayName,emailAddress,photoLink)").
		Do()

	if err != nil {
		return nil, fmt.Errorf("failed to get account info: %w", err)
	}

	return map[string]interface{}{
		"email":      about.User.EmailAddress,
		"name":       about.User.DisplayName,
		"photoUrl":   about.User.PhotoLink,
		"authorized": true,
	}, nil
}

// UploadFile uploads a file to Google Drive
func (ds *DriveSync) UploadFile(ctx context.Context, name string, content []byte, parentID string) (*drive.File, error) {
	if !ds.IsAuthenticated() {
		return nil, fmt.Errorf("not authenticated")
	}

	file := &drive.File{
		Name: name,
	}

	if parentID != "" {
		file.Parents = []string{parentID}
	}

	createdFile, err := ds.service.Files.Create(file).
		Context(ctx).
		Media(nil).
		Fields("id, name, modifiedTime").
		Do()

	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}

	return createdFile, nil
}

// DownloadFile downloads a file from Google Drive
func (ds *DriveSync) DownloadFile(ctx context.Context, fileID string) ([]byte, error) {
	if !ds.IsAuthenticated() {
		return nil, fmt.Errorf("not authenticated")
	}

	resp, err := ds.service.Files.Get(fileID).
		Context(ctx).
		Download()

	if err != nil {
		return nil, fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read file content: %w", err)
	}

	return data, nil
}

// ListFiles lists files in Google Drive
func (ds *DriveSync) ListFiles(ctx context.Context, query string) ([]*drive.File, error) {
	if !ds.IsAuthenticated() {
		return nil, fmt.Errorf("not authenticated")
	}

	fileList, err := ds.service.Files.List().
		Context(ctx).
		Q(query).
		Fields("files(id, name, modifiedTime, parents)").
		Do()

	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}

	return fileList.Files, nil
}

// GetOrCreateAppFolder gets or creates the application folder in Google Drive
func (ds *DriveSync) GetOrCreateAppFolder(ctx context.Context) (string, error) {
	// Search for existing folder
	query := "name='Fuknotion' and mimeType='application/vnd.google-apps.folder' and trashed=false"
	files, err := ds.ListFiles(ctx, query)
	if err != nil {
		return "", err
	}

	if len(files) > 0 {
		return files[0].Id, nil
	}

	// Create folder
	folder := &drive.File{
		Name:     "Fuknotion",
		MimeType: "application/vnd.google-apps.folder",
	}

	createdFolder, err := ds.service.Files.Create(folder).
		Context(ctx).
		Fields("id").
		Do()

	if err != nil {
		return "", fmt.Errorf("failed to create app folder: %w", err)
	}

	return createdFolder.Id, nil
}
