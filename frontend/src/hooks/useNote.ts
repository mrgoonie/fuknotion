import { useAppStore } from '../stores/appStore';
import { Note } from '../types';

export function useNote() {
  const {
    currentNote,
    openNotes,
    setNote,
    addOpenNote,
    removeOpenNote,
    clearOpenNotes,
  } = useAppStore();

  const selectNote = (note: Note) => {
    setNote(note);
    addOpenNote(note);
  };

  const closeNote = (noteId: string) => {
    removeOpenNote(noteId);

    // If closing current note, switch to another open note
    if (currentNote?.id === noteId) {
      const remaining = openNotes.filter((n) => n.id !== noteId);
      setNote(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const closeAllNotes = () => {
    clearOpenNotes();
    setNote(null);
  };

  return {
    currentNote,
    openNotes,
    selectNote,
    closeNote,
    closeAllNotes,
  };
}
