import type { Note } from '../../types';

interface ResultItemProps {
  note: Note;
  snippet: string;
  isActive: boolean;
  onClick: () => void;
}

export function ResultItem({ note, snippet, isActive, onClick }: ResultItemProps) {
  return (
    <div
      className={`
        px-4 py-3 cursor-pointer border-b border-border transition-colors
        ${isActive ? 'bg-bg-active' : 'hover:bg-bg-hover'}
      `}
      onClick={onClick}
    >
      {/* Note title */}
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-medium text-text-primary truncate">{note.title || 'Untitled'}</span>
        {note.isFavorite && (
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        )}
      </div>

      {/* Snippet with highlighted matches */}
      {snippet && (
        <div
          className="text-sm text-text-secondary line-clamp-2"
          dangerouslySetInnerHTML={{ __html: snippet }}
        />
      )}

      {/* Metadata */}
      <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        {note.folderId && (
          <>
            <span>•</span>
            <span>{note.folderId}</span>
          </>
        )}
      </div>
    </div>
  );
}
