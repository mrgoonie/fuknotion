package note

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

// Frontmatter represents YAML frontmatter
type Frontmatter struct {
	ID         string    `yaml:"id"`
	Title      string    `yaml:"title"`
	Created    time.Time `yaml:"created"`
	Modified   time.Time `yaml:"modified"`
	FolderID   string    `yaml:"folder_id,omitempty"`
	IsFavorite bool      `yaml:"is_favorite"`
	Tags       []string  `yaml:"tags,omitempty"`
}

// ParseMarkdown parses markdown with YAML frontmatter
func ParseMarkdown(raw string) (*Frontmatter, string, error) {
	// Check for frontmatter delimiters
	if !strings.HasPrefix(raw, "---\n") {
		return nil, raw, fmt.Errorf("missing frontmatter")
	}

	// Find end of frontmatter
	parts := strings.SplitN(raw[4:], "\n---\n", 2)
	if len(parts) != 2 {
		return nil, raw, fmt.Errorf("invalid frontmatter format")
	}

	// Parse YAML
	var fm Frontmatter
	if err := yaml.Unmarshal([]byte(parts[0]), &fm); err != nil {
		return nil, raw, fmt.Errorf("failed to parse frontmatter: %w", err)
	}

	// Extract content (skip leading newline if present)
	content := parts[1]
	if strings.HasPrefix(content, "\n") {
		content = content[1:]
	}

	return &fm, content, nil
}

// SerializeNote combines frontmatter and content into markdown
func SerializeNote(fm *Frontmatter, content string) (string, error) {
	var buf bytes.Buffer

	// Write frontmatter
	buf.WriteString("---\n")
	yamlData, err := yaml.Marshal(fm)
	if err != nil {
		return "", fmt.Errorf("failed to marshal frontmatter: %w", err)
	}
	buf.Write(yamlData)
	buf.WriteString("---\n")

	// Write content
	buf.WriteString(content)

	return buf.String(), nil
}
