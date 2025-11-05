import { useAppStore } from '../stores/appStore';
import { Note } from '../types';

export function useNote() {
  const {
    currentNote,
    openTabs,
    setNote,
    addOpenTab,
    removeOpenTab,
    clearOpenTabs,
  } = useAppStore();

  const selectNote = (note: Note) => {
    setNote(note);
    addOpenTab(note);
  };

  const closeNote = (noteId: string) => {
    removeOpenTab(noteId);

    // If closing current note, switch to another open note
    if (currentNote?.id === noteId) {
      const remaining = openTabs.filter((n: Note) => n.id !== noteId);
      setNote(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const closeAllNotes = () => {
    clearOpenTabs();
    setNote(null);
  };

  return {
    currentNote,
    openTabs,
    selectNote,
    closeNote,
    closeAllNotes,
  };
}
