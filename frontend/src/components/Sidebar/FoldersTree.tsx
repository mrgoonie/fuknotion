import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { NoteItem } from './NoteItem';

interface FoldersTreeProps {
  searchQuery: string;
}

export function FoldersTree({ searchQuery }: FoldersTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const { openTabs } = useAppStore();

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Filter notes based on search query (excluding favorites)
  const notes = openTabs.filter(note =>
    !note.isFavorite &&
    (!searchQuery || note.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group notes by folder (for now, all in root)
  const rootNotes = notes.filter(note => !note.folderId);

  const isExpanded = expandedFolders.has('root');

  return (
    <div className="mb-2">
      <button
        onClick={() => toggleFolder('root')}
        className="w-full px-3 py-2 flex items-center gap-2 text-sm font-medium text-text-secondary hover:bg-bg-hover"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span>All Notes</span>
        <span className="ml-auto text-text-tertiary">{rootNotes.length}</span>
      </button>

      {isExpanded && (
        <div className="ml-6">
          {rootNotes.length === 0 ? (
            <div className="px-3 py-2 text-sm text-text-tertiary">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            rootNotes.map(note => (
              <NoteItem key={note.id} note={note} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
