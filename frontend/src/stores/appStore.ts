import { create } from 'zustand';
import { Workspace, Note } from '../types';

interface AppState {
  // Current workspace and note
  currentWorkspace: Workspace | null;
  currentNote: Note | null;

  // Open notes (for tabs)
  openNotes: Note[];

  // Actions
  setWorkspace: (workspace: Workspace | null) => void;
  setNote: (note: Note | null) => void;
  addOpenNote: (note: Note) => void;
  removeOpenNote: (noteId: string) => void;
  clearOpenNotes: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentWorkspace: null,
  currentNote: null,
  openNotes: [],

  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  setNote: (note) => set({ currentNote: note }),

  addOpenNote: (note) =>
    set((state) => {
      // Don't add if already open
      if (state.openNotes.find((n) => n.id === note.id)) {
        return state;
      }
      return { openNotes: [...state.openNotes, note] };
    }),

  removeOpenNote: (noteId) =>
    set((state) => ({
      openNotes: state.openNotes.filter((n) => n.id !== noteId),
    })),

  clearOpenNotes: () => set({ openNotes: [] }),
}));
