import { useEffect, useState } from 'react'
import { useNoteStore } from '../../stores/noteStore'
import { SuggestionMenuController, getDefaultReactSlashMenuItems } from '@blocknote/react'
import { FileText } from 'lucide-react'

interface PageLinkMenuProps {
  editor: any
}

export function PageLinkMenu({ editor }: PageLinkMenuProps) {
  const { notes } = useNoteStore()
  const [query, setQuery] = useState('')

  const filteredNotes = notes
    .filter((note) => !note.isDeleted)
    .filter((note) =>
      note.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10) // Limit to 10 results

  const items = filteredNotes.map((note) => ({
    title: note.title,
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: 'pageLink',
          props: {
            pageId: note.id,
            title: note.title,
          },
        },
        ' ', // Add space after link
      ])
    },
    subtext: `Last modified: ${new Date(note.updatedAt).toLocaleDateString()}`,
    badge: note.isFavorite ? '⭐' : undefined,
  }))

  if (items.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-foreground-muted">
        No pages found
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden min-w-[300px] max-h-[400px] overflow-y-auto">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onItemClick}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/10 transition-colors"
        >
          <FileText className="w-4 h-4 text-foreground-subtle flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {item.title}
              </span>
              {item.badge && (
                <span className="text-xs">{item.badge}</span>
              )}
            </div>
            {item.subtext && (
              <div className="text-xs text-foreground-muted truncate">
                {item.subtext}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
