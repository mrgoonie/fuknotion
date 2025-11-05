# Research Report: File-Based Note Storage with Metadata

**From:** researcher-markdown
**To:** planner
**Date:** 2025-11-05
**Topic:** Markdown file storage with YAML frontmatter metadata

## Executive Summary

Store notes as .md files with YAML frontmatter for metadata. Standard format used by Obsidian, Zettlr, Jekyll. Frontmatter contains id, title, created, modified, folder, tags. Content is pure markdown. Benefits: readable, portable, git-friendly, easy to sync, cross-editor compatible.

## YAML Frontmatter Overview

**Structure:**
```markdown
---
id: abc123
title: Meeting Notes
created: 2025-01-15T10:30:00Z
modified: 2025-01-15T14:20:00Z
folder: work/meetings
tags: [meeting, team, q1]
is_favorite: false
---

# Meeting Notes

## Agenda

1. Review Q1 goals
2. Discuss new project
3. Team updates

## Action Items

- [ ] Follow up with design team
- [ ] Schedule next meeting
```

**Parsing:**
- Frontmatter between `---` delimiters
- YAML format (key: value)
- Parsed by standard YAML libraries
- Body content = everything after second `---`

## Frontmatter Schema for Fuknotion

### Required Fields

```yaml
---
id: string              # Unique note ID (UUID)
title: string           # Note title
created: timestamp      # ISO 8601 format
modified: timestamp     # ISO 8601 format
---
```

### Optional Fields

```yaml
folder_id: string       # Parent folder ID
is_favorite: boolean    # Favorited by user
tags: array            # List of tags
author: string         # Creator user ID
last_edited_by: string # Last editor user ID
word_count: number     # Word count (calculated)
block_count: number    # Number of blocks (calculated)
```

### Example

```yaml
---
id: note_01hqr8p3k9j2m5n6q7s8t9v0
title: Product Roadmap Q1 2025
created: 2025-01-10T09:00:00Z
modified: 2025-01-15T16:30:00Z
folder_id: folder_work_planning
is_favorite: true
tags: [roadmap, product, 2025]
author: user_abc123
last_edited_by: user_abc123
word_count: 450
block_count: 12
---

# Product Roadmap Q1 2025

## Goals
...
```

## Storage Structure

### File Organization

```
~/.fuknotion/workspaces/ws-abc123/
├── notes/
│   ├── note_01.md
│   ├── note_02.md
│   └── subfolder/
│       └── note_03.md
└── media/
    ├── image_01.png
    └── video_01.mp4
```

**File Naming:**
- Use note ID as filename: `{note-id}.md`
- Store in flat directory OR mirror folder structure

**Option A: Flat (Recommended)**
```
notes/
├── note_01.md   # folder_id: root
├── note_02.md   # folder_id: work
└── note_03.md   # folder_id: work/planning
```

**Pros:**
- Simple file management
- No directory sync issues
- Folder structure in SQLite metadata

**Option B: Nested**
```
notes/
├── note_01.md
└── work/
    ├── note_02.md
    └── planning/
        └── note_03.md
```

**Pros:**
- Visual folder structure
- Easier to browse in file manager

**Cons:**
- Harder to move notes between folders
- Directory sync complexity

**Recommendation:** Use flat structure + folder_id in frontmatter.

## Markdown Parsing

### Libraries

**Go:**
```go
import (
    "gopkg.in/yaml.v3"
    "github.com/yuin/goldmark"
)

type Note struct {
    Metadata struct {
        ID         string    `yaml:"id"`
        Title      string    `yaml:"title"`
        Created    time.Time `yaml:"created"`
        Modified   time.Time `yaml:"modified"`
        FolderID   string    `yaml:"folder_id"`
        IsFavorite bool      `yaml:"is_favorite"`
        Tags       []string  `yaml:"tags"`
    }
    Content string
}

func ParseMarkdown(raw string) (*Note, error) {
    // Split frontmatter and content
    parts := strings.Split(raw, "---\n")
    if len(parts) < 3 {
        return nil, errors.New("invalid frontmatter")
    }

    note := &Note{}

    // Parse YAML frontmatter
    err := yaml.Unmarshal([]byte(parts[1]), &note.Metadata)
    if err != nil {
        return nil, err
    }

    // Content is everything after second ---
    note.Content = strings.Join(parts[2:], "---\n")

    return note, nil
}

func SerializeNote(note *Note) string {
    // Marshal metadata to YAML
    metadata, _ := yaml.Marshal(note.Metadata)

    // Combine frontmatter + content
    return fmt.Sprintf("---\n%s---\n%s", metadata, note.Content)
}
```

**JavaScript/React:**
```js
import matter from 'gray-matter';

// Parse
const file = fs.readFileSync('note.md', 'utf8');
const { data, content } = matter(file);

console.log(data.title);      // Metadata
console.log(content);          // Markdown content

// Serialize
const markdown = matter.stringify(content, {
  id: 'abc123',
  title: 'My Note',
  created: new Date(),
  modified: new Date(),
});
```

## Integration with BlockNote Editor

### BlockNote Storage Format

**BlockNote uses JSON:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Title" }]
    }
  ]
}
```

### Conversion Strategy

**Two Storage Options:**

**Option A: Store both .json + .md**
```
notes/
├── note_01.json   # BlockNote format (for editor)
└── note_01.md     # Markdown export (for portability)
```

**Pros:**
- No conversion on load (fast)
- Perfect editor experience
- Markdown for interop

**Cons:**
- Duplicate storage
- Must keep in sync

**Option B: Store .md only, convert on load**
```
notes/
└── note_01.md     # Markdown only
```

**Pros:**
- Single source of truth
- More portable
- Smaller storage

**Cons:**
- Conversion overhead
- Potential data loss (complex blocks)

**Recommendation:** Start with Option B (md-only), add Option A if performance issues.

### Markdown ↔ BlockNote Conversion

**BlockNote supports markdown:**
```tsx
import { BlockNoteEditor } from "@blocknote/core";
import { markdownToBlocks, blocksToMarkdown } from "@blocknote/core";

// Load from .md file
const markdown = readFile('note.md');
const blocks = await markdownToBlocks(markdown);

const editor = BlockNoteEditor.create({ initialContent: blocks });

// Save to .md file
const blocks = editor.topLevelBlocks;
const markdown = await blocksToMarkdown(blocks);
writeFile('note.md', markdown);
```

**Custom blocks need serializers:**
```tsx
// Custom block: Callout with emoji
const calloutSerializer = {
  toMarkdown: (block) => {
    return `> 💡 ${block.content}`;
  },
  fromMarkdown: (line) => {
    const match = line.match(/^> (.) (.+)$/);
    return {
      type: 'callout',
      emoji: match[1],
      content: match[2],
    };
  },
};
```

## File Sync with Google Drive

### Upload Strategy

```go
func UploadNote(note *Note) error {
    // 1. Serialize note to markdown
    markdown := SerializeNote(note)

    // 2. Upload to Drive
    file := &drive.File{
        Name:     note.ID + ".md",
        MimeType: "text/markdown",
        Parents:  []string{workspaceDriveFolderID},
    }

    _, err := driveService.Files.Create(file).
        Media(strings.NewReader(markdown)).
        Do()

    return err
}
```

### Download Strategy

```go
func DownloadNote(fileID string) (*Note, error) {
    // 1. Download from Drive
    resp, err := driveService.Files.Get(fileID).
        Alt("media").
        Download()

    markdown, _ := ioutil.ReadAll(resp.Body)

    // 2. Parse markdown
    note, err := ParseMarkdown(string(markdown))

    return note, err
}
```

### Sync Conflict Resolution

**Markdown files merge well:**
```go
func MergeNotes(base, local, remote *Note) (*Note, error) {
    // 1. Merge metadata (use CRDT rules from SQLite)
    merged := &Note{}
    merged.Metadata = mergeMetadata(base, local, remote)

    // 2. Three-way merge content
    mergedContent, conflicts := diff3.Merge(
        base.Content,
        local.Content,
        remote.Content,
    )

    if len(conflicts) > 0 {
        // Show conflict UI
        return nil, ErrConflictNeedsResolution
    }

    merged.Content = mergedContent
    return merged, nil
}
```

## Internal Links

### Markdown Link Format

**Standard:**
```markdown
See [Other Note](note_abc123.md)
```

**With folder:**
```markdown
See [Project Plan](../planning/note_xyz789.md)
```

**With URL encoding:**
```markdown
[Note with spaces](note%20with%20spaces.md)
```

### Implementation

**Create Link:**
```tsx
// User types # → show note picker
// User selects note → insert link
const insertInternalLink = (targetNote) => {
  const link = `[${targetNote.title}](${targetNote.id}.md)`;
  editor.insertText(link);
};
```

**Resolve Link on Click:**
```tsx
const handleLinkClick = (href) => {
  // Extract note ID from href
  const noteID = href.replace('.md', '');

  // Open note
  openNote(noteID);
};
```

**Backlinks:**
```sql
-- Find notes linking to current note
SELECT * FROM notes
WHERE file_path IN (
    SELECT file_path FROM note_links
    WHERE target_note_id = ?
);

-- note_links table populated by parsing markdown
CREATE TABLE note_links (
    source_note_id TEXT,
    target_note_id TEXT,
    PRIMARY KEY (source_note_id, target_note_id)
);
```

## Search & Indexing

### Full-Text Search

**SQLite FTS5:**
```sql
-- Create FTS index
CREATE VIRTUAL TABLE notes_fts USING fts5(
    note_id,
    title,
    content,
    tokenize='porter unicode61'
);

-- Populate from markdown files
INSERT INTO notes_fts (note_id, title, content)
SELECT id, title, content FROM notes;

-- Search
SELECT note_id FROM notes_fts
WHERE notes_fts MATCH 'meeting AND agenda'
ORDER BY rank;
```

**Update on Edit:**
```go
func SaveNote(note *Note) error {
    // 1. Save markdown file
    writeFile(note.ID + ".md", serialize(note))

    // 2. Update FTS index
    db.Exec(`
        INSERT OR REPLACE INTO notes_fts (note_id, title, content)
        VALUES (?, ?, ?)
    `, note.ID, note.Title, note.Content)

    return nil
}
```

## Portability & Interoperability

### Benefits of Markdown Storage

**Human-Readable:**
```bash
$ cat note_01.md
---
title: My Note
---
# My Note

This is readable as-is!
```

**Version Control:**
```bash
$ git add notes/
$ git commit -m "Add meeting notes"
```

**Cross-Platform:**
- View in any text editor
- VSCode, Sublime, Vim, etc.
- No proprietary format lock-in

**Other Apps:**
- Obsidian can read Fuknotion notes
- Zettlr, Logseq, Notion (import)
- Static site generators (Hugo, Jekyll)

### Export Formats

**Built-in:**
- Markdown (native)
- Plain text (strip formatting)
- HTML (via markdown renderer)
- PDF (via HTML + print)

**Future:**
- Notion export format
- Org-mode (Emacs)
- LaTeX

## Performance Considerations

### File I/O

**Reading:**
```go
// Lazy load: only read when opening note
func OpenNote(noteID string) (*Note, error) {
    markdown, err := readFile(noteID + ".md")
    return parseMarkdown(markdown), err
}
```

**Writing:**
```go
// Debounced auto-save: save 2 seconds after edit
func AutoSave(note *Note) {
    debounce(2 * time.Second, func() {
        saveNote(note)
    })
}
```

### Caching

**In-Memory Cache:**
```go
type NoteCache struct {
    notes map[string]*Note
    mutex sync.RWMutex
}

func (c *NoteCache) Get(noteID string) *Note {
    c.mutex.RLock()
    defer c.mutex.RUnlock()
    return c.notes[noteID]
}

func (c *NoteCache) Set(noteID string, note *Note) {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    c.notes[noteID] = note
}
```

**Cache Invalidation:**
- On file change (file watcher)
- On sync completion
- On manual refresh

## Recommendations for Fuknotion

1. **Use YAML frontmatter** (standard, well-supported)
2. **Flat file structure** (simpler sync)
3. **Store .md only** (single source of truth)
4. **BlockNote ↔ markdown** conversion on load/save
5. **Internal links** via `[title](id.md)` format
6. **SQLite FTS5** for search
7. **Lazy load** notes (performance)
8. **Debounced auto-save** (avoid excessive writes)
9. **Cache open notes** (speed)

## References

- YAML frontmatter spec: https://jekyllrb.com/docs/front-matter/
- gray-matter (JS): https://github.com/jonschlinkert/gray-matter
- BlockNote markdown: https://www.blocknotejs.org/docs/converting-blocks
- SQLite FTS5: https://www.sqlite.org/fts5.html

## Unresolved Questions

- Should we support both .md and .json storage?
- How to handle BlockNote custom blocks in markdown?
- Limit on note file size before performance degrades?
