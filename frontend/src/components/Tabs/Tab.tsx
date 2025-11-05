import type { Note } from '../../types';

interface TabProps {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
}

export function Tab({ note, isActive, onSelect, onClose }: TabProps) {
  const handleMiddleClick = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      onClose(e);
    }
  };

  return (
    <div
      className={`
        group relative flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer
        transition-colors hover:bg-bg-hover text-text-secondary
        ${isActive ? 'bg-bg-primary border-b-2 border-b-accent text-text-primary' : 'bg-bg-secondary'}
      `}
      onClick={onSelect}
      onMouseDown={handleMiddleClick}
    >
      {/* Note Icon */}
      <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>

      {/* Title */}
      <span className="text-sm truncate max-w-[150px]">
        {note.title || 'Untitled'}
      </span>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded hover:bg-bg-active opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Close tab"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
