package sync

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// DriveSync handles Google Drive synchronization
type DriveSync struct {
	service *drive.Service
	config  *oauth2.Config
	token   *oauth2.Token
	dataDir string
}

// NewDriveSync creates a new Google Drive sync manager
func NewDriveSync(dataDir string) (*DriveSync, error) {
	// OAuth2 configuration for Google Drive
	config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  "http://localhost:34115/callback",
		Scopes: []string{
			drive.DriveFileScope, // Access to files created by this app
		},
		Endpoint: google.Endpoint,
	}

	return &DriveSync{
		config:  config,
		dataDir: dataDir,
	}, nil
}

// GetAuthURL returns the OAuth2 authorization URL
func (ds *DriveSync) GetAuthURL() string {
	return ds.config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
}

// ExchangeCode exchanges an authorization code for an access token
func (ds *DriveSync) ExchangeCode(ctx context.Context, code string) error {
	token, err := ds.config.Exchange(ctx, code)
	if err != nil {
		return fmt.Errorf("failed to exchange code: %w", err)
	}

	ds.token = token

	// Save token to file
	if err := ds.saveToken(); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	// Initialize Drive service
	if err := ds.initService(ctx); err != nil {
		return fmt.Errorf("failed to initialize service: %w", err)
	}

	return nil
}

// LoadToken loads a saved token from file
func (ds *DriveSync) LoadToken() error {
	tokenPath := filepath.Join(ds.dataDir, "google_token.json")
	data, err := os.ReadFile(tokenPath)
	if err != nil {
		return fmt.Errorf("failed to read token: %w", err)
	}

	var token oauth2.Token
	if err := json.Unmarshal(data, &token); err != nil {
		return fmt.Errorf("failed to parse token: %w", err)
	}

	ds.token = &token
	return nil
}

// saveToken saves the OAuth2 token to file
func (ds *DriveSync) saveToken() error {
	tokenPath := filepath.Join(ds.dataDir, "google_token.json")
	data, err := json.Marshal(ds.token)
	if err != nil {
		return fmt.Errorf("failed to marshal token: %w", err)
	}

	if err := os.WriteFile(tokenPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write token: %w", err)
	}

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
