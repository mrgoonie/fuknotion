package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// Config represents application configuration
type Config struct {
	Theme            string `json:"theme"`
	AutoSave         bool   `json:"autoSave"`
	AutoSaveInterval int    `json:"autoSaveInterval"` // milliseconds
}

// DefaultConfig returns default configuration
func DefaultConfig() *Config {
	return &Config{
		Theme:            "system",
		AutoSave:         true,
		AutoSaveInterval: 3000, // 3 seconds
	}
}

// LoadConfig loads configuration from file
func LoadConfig(configPath string) (*Config, error) {
	// Create directory if doesn't exist
	dir := filepath.Dir(configPath)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	// Check if config file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// Create default config
		cfg := DefaultConfig()
		if err := SaveConfig(configPath, cfg); err != nil {
			return nil, err
		}
		return cfg, nil
	}

	// Read config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return &cfg, nil
}

// SaveConfig saves configuration to file
func SaveConfig(configPath string, cfg *Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(configPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}
