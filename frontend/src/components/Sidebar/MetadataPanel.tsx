import type { Note } from '../../types';

interface MetadataPanelProps {
  note: Note;
}

export function MetadataPanel({ note }: MetadataPanelProps) {
  // Calculate word count from content
  const wordCount = note.content
    ? note.content.split(/\s+/).filter(word => word.length > 0).length
    : 0;

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 border-b">
      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Metadata</h4>

      <div className="space-y-3 text-sm">
        {/* Created */}
        <div>
          <div className="text-gray-500 text-xs mb-1">Created</div>
          <div className="text-gray-900">{formatDate(note.createdAt)}</div>
        </div>

        {/* Modified */}
        <div>
          <div className="text-gray-500 text-xs mb-1">Modified</div>
          <div className="text-gray-900">{formatDate(note.updatedAt)}</div>
        </div>

        {/* Word Count */}
        <div>
          <div className="text-gray-500 text-xs mb-1">Word Count</div>
          <div className="text-gray-900">{wordCount.toLocaleString()} words</div>
        </div>

        {/* Folder */}
        {note.folderId && (
          <div>
            <div className="text-gray-500 text-xs mb-1">Folder</div>
            <div className="text-gray-900">{note.folderId}</div>
          </div>
        )}

        {/* Favorite */}
        <div className="flex items-center gap-2">
          <div className="text-gray-500 text-xs">Favorite</div>
          {note.isFavorite ? (
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
