import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { NoteItem } from './NoteItem';

interface FavoritesSectionProps {
  searchQuery: string;
}

export function FavoritesSection({ searchQuery }: FavoritesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { allNotes } = useAppStore();

  // Filter favorites based on search query
  const favorites = allNotes.filter(note =>
    note.isFavorite &&
    (!searchQuery || note.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (favorites.length === 0 && !searchQuery) {
    return null; // Don't show empty favorites section
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <span>Favorites</span>
        <span className="ml-auto text-text-tertiary">{favorites.length}</span>
      </button>

      {isExpanded && (
        <div className="ml-6">
          {favorites.length === 0 ? (
            <div className="px-3 py-2 text-sm text-text-tertiary">
              No favorites found
            </div>
          ) : (
            favorites.map(note => (
              <NoteItem key={note.id} note={note} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
