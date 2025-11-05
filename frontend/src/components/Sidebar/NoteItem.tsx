import { useAppStore } from '../../stores/appStore';
import type { Note } from '../../types';

interface NoteItemProps {
  note: Note;
  isActive?: boolean;
}

export function NoteItem({ note, isActive }: NoteItemProps) {
  const { setNote, currentNote } = useAppStore();
  const active = isActive ?? (currentNote?.id === note.id);

  const handleClick = () => {
    setNote(note);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 rounded hover:bg-bg-hover ${
        active ? 'bg-bg-active text-accent' : 'text-text-secondary'
      }`}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="truncate flex-1">{note.title || 'Untitled'}</span>
      {note.isFavorite && (
        <svg className="w-3 h-3 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      )}
    </button>
  );
}
