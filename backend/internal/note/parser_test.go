package note

import (
	"strings"
	"testing"
	"time"
)

func TestParseMarkdown(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		wantErr     bool
		validateFn  func(*testing.T, *Frontmatter, string)
	}{
		{
			name: "valid frontmatter with all fields",
			input: `---
id: note_123
title: Test Note
created: 2025-01-15T10:30:00Z
modified: 2025-01-15T14:20:00Z
folder_id: folder_work
is_favorite: true
tags:
  - work
  - important
---
# Test Note

This is the content.`,
			wantErr: false,
			validateFn: func(t *testing.T, fm *Frontmatter, content string) {
				if fm.ID != "note_123" {
					t.Errorf("ID = %v, want note_123", fm.ID)
				}
				if fm.Title != "Test Note" {
					t.Errorf("Title = %v, want Test Note", fm.Title)
				}
				if fm.FolderID != "folder_work" {
					t.Errorf("FolderID = %v, want folder_work", fm.FolderID)
				}
				if !fm.IsFavorite {
					t.Error("IsFavorite = false, want true")
				}
				if len(fm.Tags) != 2 {
					t.Errorf("Tags length = %d, want 2", len(fm.Tags))
				}
				expectedContent := "# Test Note\n\nThis is the content."
				if strings.TrimSpace(content) != strings.TrimSpace(expectedContent) {
					t.Errorf("Content = %v, want %v", content, expectedContent)
				}
			},
		},
		{
			name: "valid frontmatter without optional fields",
			input: `---
id: note_456
title: Simple Note
created: 2025-01-15T10:30:00Z
modified: 2025-01-15T14:20:00Z
is_favorite: false
---
Content without folder`,
			wantErr: false,
			validateFn: func(t *testing.T, fm *Frontmatter, content string) {
				if fm.ID != "note_456" {
					t.Errorf("ID = %v, want note_456", fm.ID)
				}
				if fm.FolderID != "" {
					t.Errorf("FolderID = %v, want empty", fm.FolderID)
				}
				if len(fm.Tags) != 0 {
					t.Errorf("Tags length = %d, want 0", len(fm.Tags))
				}
			},
		},
		{
			name:    "missing frontmatter",
			input:   "Just plain content",
			wantErr: true,
		},
		{
			name: "invalid frontmatter format",
			input: `---
id: note_123
title: Test
---missing closing`,
			wantErr: true,
		},
		{
			name: "empty content",
			input: `---
id: note_789
title: Empty Note
created: 2025-01-15T10:30:00Z
modified: 2025-01-15T14:20:00Z
is_favorite: false
---
`,
			wantErr: false,
			validateFn: func(t *testing.T, fm *Frontmatter, content string) {
				if strings.TrimSpace(content) != "" {
					t.Errorf("Content = %v, want empty", content)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fm, content, err := ParseMarkdown(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseMarkdown() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.validateFn != nil {
				tt.validateFn(t, fm, content)
			}
		})
	}
}

func TestSerializeNote(t *testing.T) {
	created := time.Date(2025, 1, 15, 10, 30, 0, 0, time.UTC)
	modified := time.Date(2025, 1, 15, 14, 20, 0, 0, time.UTC)

	tests := []struct {
		name    string
		fm      *Frontmatter
		content string
		wantErr bool
	}{
		{
			name: "serialize with all fields",
			fm: &Frontmatter{
				ID:         "note_123",
				Title:      "Test Note",
				Created:    created,
				Modified:   modified,
				FolderID:   "folder_work",
				IsFavorite: true,
				Tags:       []string{"work", "important"},
			},
			content: "# Test Note\n\nThis is the content.",
			wantErr: false,
		},
		{
			name: "serialize without optional fields",
			fm: &Frontmatter{
				ID:         "note_456",
				Title:      "Simple Note",
				Created:    created,
				Modified:   modified,
				IsFavorite: false,
			},
			content: "Simple content",
			wantErr: false,
		},
		{
			name: "serialize with empty content",
			fm: &Frontmatter{
				ID:         "note_789",
				Title:      "Empty",
				Created:    created,
				Modified:   modified,
				IsFavorite: false,
			},
			content: "",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			markdown, err := SerializeNote(tt.fm, tt.content)
			if (err != nil) != tt.wantErr {
				t.Errorf("SerializeNote() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				return
			}

			// Verify it starts with frontmatter
			if !strings.HasPrefix(markdown, "---\n") {
				t.Error("Serialized markdown doesn't start with frontmatter delimiter")
			}

			// Verify content is present
			if tt.content != "" && !strings.Contains(markdown, tt.content) {
				t.Errorf("Serialized markdown doesn't contain content: %v", tt.content)
			}
		})
	}
}

func TestParseSerializeRoundTrip(t *testing.T) {
	created := time.Date(2025, 1, 15, 10, 30, 0, 0, time.UTC)
	modified := time.Date(2025, 1, 15, 14, 20, 0, 0, time.UTC)

	original := &Frontmatter{
		ID:         "note_round_trip",
		Title:      "Round Trip Test",
		Created:    created,
		Modified:   modified,
		FolderID:   "folder_test",
		IsFavorite: true,
		Tags:       []string{"test", "roundtrip"},
	}
	content := "# Round Trip Test\n\nThis tests round-trip conversion."

	// Serialize
	markdown, err := SerializeNote(original, content)
	if err != nil {
		t.Fatalf("SerializeNote() failed: %v", err)
	}

	// Parse back
	fm, parsedContent, err := ParseMarkdown(markdown)
	if err != nil {
		t.Fatalf("ParseMarkdown() failed: %v", err)
	}

	// Verify all fields match
	if fm.ID != original.ID {
		t.Errorf("ID = %v, want %v", fm.ID, original.ID)
	}
	if fm.Title != original.Title {
		t.Errorf("Title = %v, want %v", fm.Title, original.Title)
	}
	if fm.FolderID != original.FolderID {
		t.Errorf("FolderID = %v, want %v", fm.FolderID, original.FolderID)
	}
	if fm.IsFavorite != original.IsFavorite {
		t.Errorf("IsFavorite = %v, want %v", fm.IsFavorite, original.IsFavorite)
	}

	// Compare times (allow small difference due to serialization)
	if fm.Created.Unix() != original.Created.Unix() {
		t.Errorf("Created = %v, want %v", fm.Created, original.Created)
	}
	if fm.Modified.Unix() != original.Modified.Unix() {
		t.Errorf("Modified = %v, want %v", fm.Modified, original.Modified)
	}

	// Compare tags
	if len(fm.Tags) != len(original.Tags) {
		t.Errorf("Tags length = %d, want %d", len(fm.Tags), len(original.Tags))
	} else {
		for i := range fm.Tags {
			if fm.Tags[i] != original.Tags[i] {
				t.Errorf("Tags[%d] = %v, want %v", i, fm.Tags[i], original.Tags[i])
			}
		}
	}

	// Compare content (trim whitespace for comparison)
	if strings.TrimSpace(parsedContent) != strings.TrimSpace(content) {
		t.Errorf("Content = %v, want %v", parsedContent, content)
	}
}
