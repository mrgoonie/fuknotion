# Fuknotion Design Guidelines

**Version:** 1.0
**Last Updated:** 2025-10-28
**Status:** Initial Release

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Specifications](#component-specifications)
6. [Animation & Transitions](#animation--transitions)
7. [Accessibility Standards](#accessibility-standards)
8. [Icon Guidelines](#icon-guidelines)
9. [Theme Implementation](#theme-implementation)

---

## Design Philosophy

Fuknotion follows **YAGNI, KISS, DRY** principles with design inspired by Notion, Linear, and Arc browser. Core values:

- **Readability First**: This is a reading-heavy app. Prioritize legibility, comfortable line heights, optimal contrast
- **Keyboard-First**: Power users rely on shortcuts. All actions accessible via keyboard
- **Performance**: Smooth 60fps animations, instant feedback, no janky interactions
- **Minimal Chrome**: Less UI chrome = more content. Hide toolbars until needed
- **Accessibility**: WCAG 2.1 AA minimum. Screen reader support, keyboard navigation, contrast compliance

---

## Color System

### Base Palette

**Philosophy**: Warm grays (not harsh blacks) for comfortable extended reading. Off-white backgrounds reduce eye strain. High contrast for text legibility (15:1+ ratio).

#### Light Mode

```css
/* Backgrounds */
--background: hsl(0, 0%, 98%);          /* #FAFAFA - Primary background */
--surface: hsl(0, 0%, 100%);            /* #FFFFFF - Cards, panels */
--surface-elevated: hsl(0, 0%, 100%);   /* #FFFFFF - Modals, popovers */

/* Text */
--foreground: hsl(0, 0%, 12%);          /* #1F1F1F - Primary text */
--foreground-muted: hsl(0, 0%, 38%);    /* #616161 - Secondary text */
--foreground-subtle: hsl(0, 0%, 62%);   /* #9E9E9E - Tertiary text */

/* Borders */
--border: hsl(0, 0%, 89%);              /* #E3E3E3 - Standard borders */
--border-subtle: hsl(0, 0%, 94%);       /* #F0F0F0 - Subtle dividers */

/* Accent (Sky Blue - Professional, Calm) */
--accent: hsl(199, 89%, 48%);           /* #0EA5E9 */
--accent-hover: hsl(199, 89%, 42%);     /* #0891CF */
--accent-active: hsl(199, 89%, 38%);    /* #0779B3 */
--accent-subtle: hsl(199, 89%, 96%);    /* #F0F9FF - Backgrounds */

/* States */
--success: hsl(142, 71%, 45%);          /* #10B981 */
--warning: hsl(38, 92%, 50%);           /* #F59E0B */
--error: hsl(0, 84%, 60%);              /* #EF4444 */
--info: hsl(217, 91%, 60%);             /* #3B82F6 */
```

#### Dark Mode

```css
/* Backgrounds */
--background: hsl(0, 0%, 10%);          /* #191919 - Primary background (NOT pure black) */
--surface: hsl(0, 0%, 14%);             /* #242424 - Cards, panels */
--surface-elevated: hsl(0, 0%, 18%);    /* #2E2E2E - Modals, popovers */

/* Text */
--foreground: hsl(0, 0%, 89%);          /* #E3E3E3 - Primary text */
--foreground-muted: hsl(0, 0%, 62%);    /* #9E9E9E - Secondary text */
--foreground-subtle: hsl(0, 0%, 46%);   /* #757575 - Tertiary text */

/* Borders */
--border: hsl(0, 0%, 20%);              /* #333333 - Standard borders */
--border-subtle: hsl(0, 0%, 16%);       /* #292929 - Subtle dividers */

/* Accent (Sky Blue - Desaturated for dark mode) */
--accent: hsl(199, 80%, 52%);           /* #38BDF8 - Slightly brighter */
--accent-hover: hsl(199, 80%, 58%);     /* #7DD3FC */
--accent-active: hsl(199, 80%, 48%);    /* #0284C7 */
--accent-subtle: hsl(199, 50%, 20%);    /* #0C4A6E - Backgrounds */

/* States (Desaturated) */
--success: hsl(142, 60%, 50%);          /* #34D399 */
--warning: hsl(38, 80%, 55%);           /* #FBA026 */
--error: hsl(0, 70%, 58%);              /* #F87171 */
--info: hsl(217, 80%, 65%);             /* #60A5FA */
```

### Block/Callout Colors

**Notion-inspired palette for callouts, highlights, and block backgrounds:**

#### Light Mode

```css
--callout-gray-bg: hsl(0, 0%, 96%);         /* #F5F5F5 */
--callout-gray-border: hsl(0, 0%, 85%);     /* #D9D9D9 */

--callout-blue-bg: hsl(212, 100%, 96%);     /* #EFF6FF */
--callout-blue-border: hsl(212, 100%, 85%); /* #BFDBFE */

--callout-green-bg: hsl(142, 71%, 96%);     /* #ECFDF5 */
--callout-green-border: hsl(142, 71%, 85%); /* #A7F3D0 */

--callout-yellow-bg: hsl(48, 100%, 96%);    /* #FEFCE8 */
--callout-yellow-border: hsl(48, 100%, 85%);/* #FEF08A */

--callout-red-bg: hsl(0, 100%, 96%);        /* #FEF2F2 */
--callout-red-border: hsl(0, 100%, 85%);    /* #FCA5A5 */

--callout-purple-bg: hsl(270, 100%, 96%);   /* #FAF5FF */
--callout-purple-border: hsl(270, 100%, 85%);/* #DDD6FE */
```

#### Dark Mode

```css
--callout-gray-bg: hsl(0, 0%, 15%);         /* #262626 */
--callout-gray-border: hsl(0, 0%, 25%);     /* #404040 */

--callout-blue-bg: hsl(212, 50%, 20%);      /* #1E3A5F */
--callout-blue-border: hsl(212, 50%, 30%);  /* #2B5584 */

--callout-green-bg: hsl(142, 40%, 20%);     /* #1F3D2E */
--callout-green-border: hsl(142, 40%, 30%); /* #2E5C45 */

--callout-yellow-bg: hsl(48, 80%, 20%);     /* #4D4520 */
--callout-yellow-border: hsl(48, 80%, 30%); /* #736830 */

--callout-red-bg: hsl(0, 80%, 20%);         /* #4D1F1F */
--callout-red-border: hsl(0, 80%, 30%);     /* #732E2E */

--callout-purple-bg: hsl(270, 50%, 20%);    /* #3A2F5F */
--callout-purple-border: hsl(270, 50%, 30%);/* #554584 */
```

### Inline Code & Syntax Highlighting

```css
/* Inline Code (Hot Color - Stands Out) */
--code-inline-bg: hsla(0, 0%, 50%, 0.15);   /* rgba(135, 131, 120, 0.15) */
--code-inline-text: hsl(0, 0%, 30%);        /* #4D4D4D (light mode) */
--code-inline-text-dark: hsl(0, 0%, 80%);   /* #CCCCCC (dark mode) */

/* Code Block Background */
--code-block-bg: hsl(0, 0%, 97%);           /* #F7F7F7 (light) */
--code-block-bg-dark: hsl(0, 0%, 12%);      /* #1F1F1F (dark) */

/* Syntax Highlighting (Night Owl inspired for dark, GitHub Light for light) */
/* Use Shiki or Prism with these themes */
```

---

## Typography

### Font Stack

**Primary Font: Inter** - Purpose-designed for screen legibility, excellent rendering at 11px+, used by GitHub, Mozilla, OpenAI.

**Monospace Font: Geist Mono** - Modern monospace for code blocks, clean and readable.

**Fallback Stack**:
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Geist Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Courier New', monospace;
```

### Type Scale (8px Grid Based)

**Base size: 16px (1rem)** - Optimal reading size for body text.

```css
/* Headings */
--text-h1: 2rem;          /* 32px */
--text-h1-weight: 700;
--text-h1-line-height: 1.2;

--text-h2: 1.5rem;        /* 24px */
--text-h2-weight: 600;
--text-h2-line-height: 1.3;

--text-h3: 1.25rem;       /* 20px */
--text-h3-weight: 600;
--text-h3-line-height: 1.4;

/* Body */
--text-body: 1rem;        /* 16px */
--text-body-weight: 400;
--text-body-line-height: 1.6;

--text-body-large: 1.125rem; /* 18px */

--text-body-small: 0.875rem; /* 14px - UI chrome, metadata */
--text-body-small-line-height: 1.5;

/* Tiny (Captions, Labels) */
--text-caption: 0.75rem;  /* 12px */
--text-caption-weight: 500;
--text-caption-line-height: 1.4;
```

### Reading Content Optimization

For long-form content (editor):
- **Max width**: 740px (65-75 characters per line)
- **Line height**: 1.6-1.7 for body text
- **Paragraph spacing**: 1.5rem (24px)
- **Font smoothing**: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`

---

## Spacing & Layout

### Grid System

**Base unit: 8px** - All spacing derives from 8px increments for visual rhythm.

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
--space-10: 4rem;    /* 64px */
--space-12: 6rem;    /* 96px */
```

### Component Spacing Conventions

- **Inline elements**: 4px, 8px
- **Block elements**: 8px, 16px, 24px
- **Section spacing**: 32px, 48px
- **Page margins**: 48px, 64px (desktop)

### Layout Measurements

```css
/* Sidebar */
--sidebar-width: 224px;           /* Collapsed: 48px (icon-only) */
--sidebar-max-width: 320px;       /* Comfortable reading */

/* Title Bar */
--titlebar-height: 48px;          /* Standard desktop (32-48px range) */

/* Tab Bar */
--tabbar-height: 40px;

/* Editor Max Width */
--editor-max-width: 740px;        /* 65-75 chars optimal readability */

/* Content Padding */
--content-padding-x: 48px;        /* Desktop horizontal padding */
--content-padding-y: 32px;        /* Desktop vertical padding */
--content-padding-mobile: 16px;   /* Mobile all-around padding */
```

### Border Radius

```css
--radius-sm: 4px;     /* Small elements (badges, tags) */
--radius-md: 6px;     /* Standard (buttons, inputs) */
--radius-lg: 8px;     /* Cards, callouts, blocks */
--radius-xl: 12px;    /* Modals, command palette */
--radius-2xl: 16px;   /* Large surfaces */
--radius-full: 9999px;/* Pills, avatars */
```

### Shadows

**Layered depth system** for elevation hierarchy:

```css
/* Light Mode */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Dark Mode - Softer shadows */
--shadow-sm-dark: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md-dark: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg-dark: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
--shadow-xl-dark: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5);
--shadow-2xl-dark: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
```

**Usage:**
- `sm`: Subtle elevation (hover states)
- `md`: Standard cards/blocks
- `lg`: Modals/overlays
- `xl`: Floating toolbars, command palette
- `2xl`: Maximum elevation (drag states)

---

## Component Specifications

### Sidebar

**Dimensions:**
- Expanded: 224px width
- Collapsed: 48px (icon-only)
- Max width: 320px

**Structure:**
```
Sidebar Header (48px height)
  - Logo/Title
  - Collapse toggle
├─ Search Bar (40px height, 8px margin)
├─ Quick Actions (32px height each)
│  ├─ New Page
│  ├─ Templates
│  └─ Import
├─ Separator (1px)
├─ Favorites Section
│  └─ Draggable page list
├─ Separator
├─ Workspace Section
│  └─ Nested folders/pages (expandable)
├─ Separator
└─ Footer (48px height)
   ├─ Settings
   ├─ Trash
   └─ Theme toggle
```

**Interaction:**
- Hover: Show page options (drag handle, more menu)
- Drag-drop: Reorder pages, move into folders
- Expand/collapse: Arrow icons for nested items
- Keyboard: Arrow keys navigate, Enter opens, Escape closes

**States:**
- Default: `--surface` background
- Hover: `--surface-elevated` background
- Active/Selected: `--accent-subtle` background, `--accent` left border (3px)
- Dragging: `--shadow-xl`, 0.7 opacity

### Tab Bar

**Dimensions:**
- Height: 40px
- Tab min-width: 120px
- Tab max-width: 200px

**Tab Structure:**
```
[Icon (16x16)] [Title (truncated)] [Close (×)]
```

**Interaction:**
- Click: Switch to tab
- Middle-click: Close tab
- Drag: Reorder tabs
- Close button: Appears on hover
- Unsaved indicator: Blue dot before title

**States:**
- Inactive: `--foreground-muted` text, `--surface` background
- Hover: `--surface-elevated` background
- Active: `--foreground` text, `--border-subtle` bottom border (2px)

### Editor Area

**Layout:**
- Max width: 740px (centered)
- Padding: 48px horizontal, 32px vertical (desktop)
- Padding: 16px all (mobile)

**Block Types:**
- Paragraph: 16px font, 1.6 line-height
- Heading 1: 32px, bold, 48px top margin
- Heading 2: 24px, semibold, 32px top margin
- Heading 3: 20px, semibold, 24px top margin
- List: 16px, 24px left indent
- Code block: `--code-block-bg`, 12px padding, rounded-lg, 14px mono font
- Callout: 16px padding, rounded-lg, left border 3px, icon 20x20
- Image: Max width 100%, rounded-lg, 16px vertical margin
- Divider: 1px `--border` color, 32px vertical margin
- Table: Full width, 8px cell padding, alternating row colors
- Todo: Checkbox (16x16), 8px gap, strikethrough when checked

### Mini Toolbar (Text Selection)

**Dimensions:**
- Height: 40px
- Padding: 4px
- Border radius: 8px

**Positioning:**
- 8px above selection (default)
- Falls below if insufficient space above
- Horizontally centered to selection

**Actions (32x32 buttons, 4px gap):**
- Bold (⌘B)
- Italic (⌘I)
- Underline (⌘U)
- Strikethrough
- Code (inline)
- Link (⌘K)
- Text color picker
- Highlight color picker
- Comment

**Appearance:**
- Background: `--surface-elevated`
- Border: 1px `--border`
- Shadow: `--shadow-xl`
- Animation: Fade in 150ms, scale 0.95 → 1.0

### Slash Command Menu

**Dimensions:**
- Width: 320px
- Max height: 400px (scrollable)
- Border radius: 12px

**Positioning:**
- Appears below cursor on `/` press
- Falls above if insufficient space below

**Structure:**
```
[Search Input (40px)]
├─ Building Blocks
│  ├─ Text
│  ├─ Heading 1/2/3
│  ├─ Bulleted List
│  ├─ Numbered List
│  ├─ Todo List
│  ├─ Toggle List
│  └─ Callout
├─ Media
│  ├─ Image
│  ├─ Video
│  ├─ File
│  └─ Code Block
├─ Inline
│  ├─ Mention (@)
│  ├─ Date
│  ├─ Link
│  └─ Emoji
└─ Advanced
   ├─ Divider
   ├─ Table
   ├─ Columns (1-4)
   └─ Math Equation
```

**Item Format:**
```
[Icon (20x20)] [Label] [Shortcut hint]
```

**Interaction:**
- Fuzzy search filter
- Arrow keys navigate
- Enter selects
- Escape dismisses
- Click selects

**States:**
- Default: `--surface` background
- Hover/Selected: `--accent-subtle` background

### Search Modal (⌘K)

**Dimensions:**
- Width: 600px (desktop), 90vw (mobile)
- Max height: 500px
- Border radius: 12px

**Structure:**
```
[Search Input (56px)]
└─ Results List (scrollable)
   ├─ Recent (if no query)
   ├─ Pages
   ├─ Blocks
   └─ Commands
```

**Result Item:**
```
[Icon] [Title]
       [Breadcrumb/Preview]
```

**Appearance:**
- Background: `--surface-elevated`
- Shadow: `--shadow-2xl`
- Backdrop: Blur 8px, rgba(0,0,0,0.5)

### Settings Panel

**Dimensions:**
- Width: 800px (desktop modal)
- Full screen (mobile)

**Structure:**
```
Sidebar (200px)          Content Area (600px)
├─ Account               ← Active settings page
├─ Workspace
├─ Theme & Appearance
├─ Keyboard Shortcuts
├─ Privacy & Security
└─ About
```

**Layout:**
- Two-column on desktop
- Single-column on mobile
- Scrollable content area

---

## Animation & Transitions

### Principles

- **Smooth 60fps**: Use GPU-accelerated properties (`transform`, `opacity`)
- **Purposeful**: Animations guide attention, provide feedback
- **Subtle**: Durations 150-300ms for UI, 500ms max for complex
- **Respect preferences**: Honor `prefers-reduced-motion`

### Timing Functions

```css
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);    /* Material Design standard */
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);  /* Fast start, slow end */
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);    /* Slow start, fast end */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Overshoot */
```

### Transition Durations

```css
--duration-instant: 0ms;       /* Reduced motion mode */
--duration-fast: 100ms;        /* Hover states */
--duration-normal: 200ms;      /* Standard transitions */
--duration-slow: 300ms;        /* Complex animations */
--duration-slower: 500ms;      /* Page transitions */
```

### Common Transitions

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Usage: 200ms ease-standard */
```

**Slide Up:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Usage: 300ms ease-decelerate */
```

**Scale In:**
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
/* Usage: 200ms ease-standard */
```

**Skeleton Loading:**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
/* Usage: 2s linear infinite */
```

### Component-Specific Animations

**Button Hover:**
- Scale: 1.0 → 1.02
- Duration: 150ms
- Easing: ease-standard

**Modal Enter:**
- Backdrop: opacity 0 → 1 (200ms)
- Content: scale 0.95 → 1.0, opacity 0 → 1 (300ms ease-decelerate)

**Toast Notification:**
- Enter: slideUp (300ms)
- Exit: fadeOut (200ms)
- Auto-dismiss: 5s delay

**Page Transition:**
- Exit: fadeOut + translateY(-20px) (200ms)
- Enter: fadeIn + translateY(0) from 20px (300ms)
- Total: 500ms with 100ms overlap

**Drag Feedback:**
- Lift: scale 1.05, shadow-xl (100ms)
- Drop: scale 1.0, shadow-md (200ms ease-bounce)

### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Minimum Requirements:**

1. **Color Contrast**
   - Normal text (16px): 4.5:1 minimum
   - Large text (24px+): 3:1 minimum
   - UI components: 3:1 minimum
   - Target: AAA (7:1 for text) where possible

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Tab order follows visual hierarchy
   - Focus indicators visible (2px ring, `--accent` color)
   - Escape dismisses modals/menus
   - Arrow keys navigate lists/menus
   - Enter/Space activates buttons

3. **Screen Readers**
   - Semantic HTML5 (`<nav>`, `<main>`, `<aside>`, `<article>`)
   - ARIA labels for icon-only buttons
   - ARIA live regions for dynamic content
   - Role attributes (`role="dialog"`, `role="menu"`)
   - Alt text for all images

4. **Focus Management**
   - Focus trap in modals
   - Return focus after modal closes
   - Skip links for main content
   - Visible focus indicators (no `outline: none` without replacement)

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* Alternative ring style */
.focus-ring:focus-visible {
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--accent);
}
```

### Keyboard Shortcuts

**Global:**
- `⌘/Ctrl + K`: Command palette
- `⌘/Ctrl + N`: New page
- `⌘/Ctrl + P`: Quick search
- `⌘/Ctrl + B`: Toggle sidebar
- `⌘/Ctrl + ,`: Settings
- `⌘/Ctrl + /`: Keyboard shortcuts reference

**Editor:**
- `⌘/Ctrl + B`: Bold
- `⌘/Ctrl + I`: Italic
- `⌘/Ctrl + U`: Underline
- `⌘/Ctrl + K`: Insert link
- `⌘/Ctrl + E`: Inline code
- `/`: Slash command menu
- `@`: Mention menu
- `#`: Link to page
- `Tab`: Indent block
- `Shift + Tab`: Outdent block
- `⌘/Ctrl + D`: Duplicate block
- `⌘/Ctrl + Shift + Up/Down`: Move block up/down

**Tab Management:**
- `⌘/Ctrl + 1-9`: Switch to tab 1-9
- `⌘/Ctrl + W`: Close current tab
- `⌘/Ctrl + Shift + T`: Reopen closed tab

---

## Icon Guidelines

### Icon Library

**Primary: Lucide React** - 1,000+ outlined icons, tree-shakeable, consistent stroke width (1.5px).

**Fallback: Remix Icon** - 3,100+ icons if Lucide doesn't have needed icon.

### Icon Sizing

```css
--icon-xs: 12px;   /* Inline with small text */
--icon-sm: 16px;   /* Standard inline, list items */
--icon-md: 20px;   /* Buttons, toolbars */
--icon-lg: 24px;   /* Page headers, empty states */
--icon-xl: 32px;   /* Large actions, onboarding */
--icon-2xl: 48px;  /* Feature illustrations */
```

**Usage:**
- Sidebar items: 16px
- Toolbar buttons: 20px
- Slash command menu: 20px
- Block type indicators: 16px
- Tab icons: 16px

### Icon Colors

```css
/* Follow text color hierarchy */
--icon-primary: var(--foreground);
--icon-secondary: var(--foreground-muted);
--icon-tertiary: var(--foreground-subtle);
--icon-accent: var(--accent);
--icon-success: var(--success);
--icon-warning: var(--warning);
--icon-error: var(--error);
```

### Icon Usage

- **Always with labels**: Don't rely on icons alone (accessibility)
- **Consistent meaning**: Same icon = same action across app
- **Outlined style**: Use outlined variants for consistency
- **Optical alignment**: Adjust vertical alignment if icon looks off-center

### Common Icons

```typescript
// Lucide React imports
import {
  FileText,        // Document/Page
  Search,          // Search
  Settings,        // Settings
  Trash2,          // Trash/Delete
  Plus,            // Add/New
  ChevronRight,    // Expand
  ChevronDown,     // Collapse
  MoreHorizontal,  // More options
  Hash,            // Heading
  List,            // Bulleted list
  ListOrdered,     // Numbered list
  CheckSquare,     // Todo
  Image,           // Image block
  Code,            // Code block
  Link,            // Link
  Bold,            // Bold
  Italic,          // Italic
  Underline,       // Underline
  Strikethrough,   // Strikethrough
  Sun,             // Light mode
  Moon,            // Dark mode
  Archive,         // Archive
  Star,            // Favorite
} from 'lucide-react'
```

---

## Theme Implementation

### Theme Toggle

**Location**: Sidebar footer or settings panel

**Modes:**
- Light (default)
- Dark
- System (follow OS preference)

**Storage**: `localStorage.theme` = `'light' | 'dark' | 'system'`

### Implementation Pattern

```typescript
// theme.ts
type Theme = 'light' | 'dark' | 'system'

function getTheme(): Theme {
  return (localStorage.theme as Theme) || 'system'
}

function setTheme(theme: Theme) {
  localStorage.theme = theme
  applyTheme(theme)
}

function applyTheme(theme: Theme) {
  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', systemDark)
  } else {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (getTheme() === 'system') {
    document.documentElement.classList.toggle('dark', e.matches)
  }
})

// Apply on load
applyTheme(getTheme())
```

### CSS Variables Approach

```css
/* globals.css */
:root {
  /* Light mode variables */
  --background: hsl(0, 0%, 98%);
  /* ... all other variables ... */
}

.dark {
  /* Dark mode overrides */
  --background: hsl(0, 0%, 10%);
  /* ... all other variables ... */
}

/* Components reference variables */
body {
  background-color: var(--background);
  color: var(--foreground);
}
```

### Preventing Flash

```html
<!-- index.html - Add before React loads -->
<script>
  (function() {
    const theme = localStorage.theme || 'system'
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  })()
</script>
```

---

## Additional Guidelines

### Empty States

**Design:**
- Centered content
- Large icon (48px)
- Heading + description
- Primary action button

**Examples:**
- No pages: "Create your first page"
- Search no results: "No results for '{query}'"
- Trash empty: "Trash is empty"

### Loading States

**Skeleton Screens:**
- Use for initial page load
- Match layout of loaded content
- Shimmer animation (2s loop)
- Gray backgrounds (`--border-subtle`)

**Spinners:**
- Use for actions (saving, loading)
- 20px size for inline, 32px for page
- Accent color

### Error States

**Design:**
- Red error icon
- Clear error message
- Suggested action
- Retry button

**Toast Notifications:**
- 4s duration (success/info)
- 6s duration (warning/error)
- Dismissable
- Bottom-right position (desktop)
- Top position (mobile)

### Responsive Breakpoints

```css
--breakpoint-mobile: 640px;    /* Mobile (< 640px) */
--breakpoint-tablet: 768px;    /* Tablet (640-1024px) */
--breakpoint-desktop: 1024px;  /* Desktop (> 1024px) */
--breakpoint-wide: 1440px;     /* Wide desktop */
```

**Mobile Adaptations:**
- Sidebar: Overlay mode (not fixed)
- Tabs: Horizontal scroll
- Toolbar: Compact with dropdown menu
- Padding: Reduce to 16px
- Font sizes: Maintain (no scaling)

---

## Design Review Checklist

Before shipping any component:

- [ ] Contrast ratios meet WCAG AA (use contrast checker)
- [ ] Keyboard navigation works (tab through entire flow)
- [ ] Screen reader announces content (test with VoiceOver/NVDA)
- [ ] Focus indicators visible
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Works in light and dark themes
- [ ] Responsive on mobile (320px+), tablet, desktop
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Touch targets 44x44px minimum (mobile)
- [ ] Icons have labels/tooltips
- [ ] Color not sole indicator (use icons/text too)
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Passes automated accessibility audit (Lighthouse, axe)

---

## Resources

**Design References:**
- Notion: https://notion.so
- Linear: https://linear.app
- Arc Browser: https://arc.net

**Color Tools:**
- Contrast Checker: https://webaim.org/resources/contrastchecker/
- Coolors Palette Generator: https://coolors.co
- HSL Picker: https://hslpicker.com

**Typography:**
- Inter Font: https://fonts.google.com/specimen/Inter
- Modular Scale Calculator: https://www.modularscale.com

**Icons:**
- Lucide: https://lucide.dev
- Remix Icon: https://remixicon.com

**Accessibility:**
- WebAIM: https://webaim.org
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- A11y Project: https://www.a11yproject.com

---

**End of Design Guidelines v1.0**
