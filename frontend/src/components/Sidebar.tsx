import { useState } from 'react'
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Star,
  FileText,
  Settings,
  Trash2,
  GripVertical,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { useNoteStore } from '../stores/noteStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useUIStore } from '../stores/uiStore'
import { cn } from '../lib/utils'
import { Note } from '../lib/types'

export function Sidebar() {
  const { notes, currentNote, setCurrentNote, createNote, toggleFavorite } = useNoteStore()
  const { currentWorkspace } = useWorkspaceStore()
  const { isSidebarCollapsed, toggleSidebar, addTab } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const favoriteNotes = notes.filter(n => n.isFavorite && !n.isDeleted)
  const workspaceNotes = notes.filter(n => !n.isDeleted && !n.parentId)
  const filteredNotes = searchQuery
    ? workspaceNotes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workspaceNotes

  const handleCreateNote = async () => {
    if (!currentWorkspace) return
    const note = await createNote(currentWorkspace.id, 'Untitled', '')
    if (note) {
      addTab({ id: note.id, noteId: note.id, title: note.title })
      setCurrentNote(note)
    }
  }

  const handleNoteClick = (note: Note) => {
    addTab({ id: note.id, noteId: note.id, title: note.title })
    setCurrentNote(note)
  }

  const toggleFolder = (noteId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId)
    } else {
      newExpanded.add(noteId)
    }
    setExpandedFolders(newExpanded)
  }

  if (isSidebarCollapsed) {
    return (
      <div className="w-12 bg-surface border-r border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center",
            "hover:bg-surface-elevated transition-colors",
            "text-foreground-muted"
          )}
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
        <button
          onClick={handleCreateNote}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center",
            "hover:bg-surface-elevated transition-colors",
            "text-foreground-muted"
          )}
          aria-label="New page"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center",
            "hover:bg-surface-elevated transition-colors",
            "text-foreground-muted"
          )}
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-56 bg-surface border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-border-subtle">
        <span className="text-sm font-semibold text-foreground truncate">
          {currentWorkspace?.name || 'Workspace'}
        </span>
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-6 h-6 rounded flex items-center justify-center",
            "hover:bg-surface-elevated transition-colors",
            "text-foreground-muted"
          )}
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-8 pr-3 rounded-md",
              "bg-background border border-border",
              "text-sm text-foreground placeholder:text-foreground-subtle",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
              "transition-colors"
            )}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-2 pb-2">
        <button
          onClick={handleCreateNote}
          className={cn(
            "w-full h-8 px-2 rounded-md flex items-center gap-2",
            "hover:bg-surface-elevated transition-colors",
            "text-sm text-foreground-muted"
          )}
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Favorites Section */}
        {favoriteNotes.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-foreground-subtle uppercase tracking-wide">
              Favorites
            </div>
            <div className="space-y-0.5">
              {favoriteNotes.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={currentNote?.id === note.id}
                  onClick={() => handleNoteClick(note)}
                  onToggleFavorite={() => toggleFavorite(note.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Workspace Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-foreground-subtle uppercase tracking-wide">
            {currentWorkspace?.name || 'Notes'}
          </div>
          <div className="space-y-0.5">
            {filteredNotes.length === 0 ? (
              <div className="px-2 py-4 text-sm text-foreground-subtle text-center">
                {searchQuery ? 'No results' : 'No pages yet'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={currentNote?.id === note.id}
                  onClick={() => handleNoteClick(note)}
                  onToggleFavorite={() => toggleFavorite(note.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border-subtle p-2 space-y-0.5">
        <button
          className={cn(
            "w-full h-8 px-2 rounded-md flex items-center gap-2",
            "hover:bg-surface-elevated transition-colors",
            "text-sm text-foreground-muted"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button
          className={cn(
            "w-full h-8 px-2 rounded-md flex items-center gap-2",
            "hover:bg-surface-elevated transition-colors",
            "text-sm text-foreground-muted"
          )}
        >
          <Trash2 className="w-4 h-4" />
          <span>Trash</span>
        </button>
      </div>
    </div>
  )
}

interface NoteItemProps {
  note: Note
  isActive: boolean
  onClick: () => void
  onToggleFavorite: () => void
  depth?: number
}

function NoteItem({ note, isActive, onClick, onToggleFavorite, depth = 0 }: NoteItemProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={cn(
        "group relative h-8 px-2 rounded-md flex items-center gap-1.5",
        "transition-colors cursor-pointer",
        isActive
          ? "bg-accent-subtle border-l-3 border-accent text-foreground"
          : "hover:bg-surface-elevated text-foreground-muted"
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Drag Handle */}
      {showActions && (
        <button
          className="w-4 h-4 flex items-center justify-center text-foreground-subtle hover:text-foreground"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </button>
      )}

      {/* Icon */}
      <FileText className="w-4 h-4 flex-shrink-0" />

      {/* Title */}
      <span className="flex-1 text-sm truncate">
        {note.title || 'Untitled'}
      </span>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={cn(
              "w-5 h-5 flex items-center justify-center rounded",
              "hover:bg-background transition-colors",
              note.isFavorite ? "text-warning" : "text-foreground-subtle"
            )}
            aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className="w-3 h-3" fill={note.isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-background transition-colors text-foreground-subtle"
            aria-label="More options"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
