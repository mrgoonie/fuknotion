import { useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Tab } from './Tab';

export function TabBar() {
  const { openTabs, currentNote, setNote, removeOpenTab } = useAppStore();

  const handleSelectTab = (noteId: string) => {
    const note = openTabs.find(n => n.id === noteId);
    if (note) {
      setNote(note);
    }
  };

  const handleCloseTab = useCallback((noteId: string) => {
    const tabIndex = openTabs.findIndex(n => n.id === noteId);

    // If closing the current tab, switch to adjacent tab
    if (currentNote?.id === noteId) {
      if (openTabs.length > 1) {
        // Try next tab, or previous if last tab
        const nextTab = openTabs[tabIndex + 1] || openTabs[tabIndex - 1];
        setNote(nextTab);
      } else {
        setNote(null);
      }
    }

    removeOpenTab(noteId);
  }, [openTabs, currentNote, setNote, removeOpenTab]);

  // Keyboard shortcut: Cmd/Ctrl+W to close current tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (currentNote) {
          handleCloseTab(currentNote.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNote, handleCloseTab]);

  if (openTabs.length === 0) {
    return (
      <div className="h-10 border-b bg-gray-50 flex items-center px-4 text-sm text-gray-500">
        No tabs open
      </div>
    );
  }

  return (
    <div className="h-10 border-b bg-gray-50 flex items-center overflow-x-auto">
      <div className="flex">
        {openTabs.map((note) => (
          <Tab
            key={note.id}
            note={note}
            isActive={currentNote?.id === note.id}
            onSelect={() => handleSelectTab(note.id)}
            onClose={(e) => {
              e.stopPropagation();
              handleCloseTab(note.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
