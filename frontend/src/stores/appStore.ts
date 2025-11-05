import { create } from 'zustand';
import { Workspace, Note } from '../types';

interface AppState {
  // Current workspace and note
  currentWorkspace: Workspace | null;
  currentNote: Note | null;

  // Open tabs
  openTabs: Note[];

  // All notes list
  allNotes: Note[];

  // Actions
  setWorkspace: (workspace: Workspace | null) => void;
  setNote: (note: Note | null) => void;
  addOpenTab: (note: Note) => void;
  removeOpenTab: (noteId: string) => void;
  clearOpenTabs: () => void;
  setAllNotes: (notes: Note[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentWorkspace: null,
  currentNote: null,
  openTabs: [],
  allNotes: [],

  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  setNote: (note) => set({ currentNote: note }),

  addOpenTab: (note) =>
    set((state) => {
      // Don't add if already open
      if (state.openTabs.find((n) => n.id === note.id)) {
        return state;
      }
      return { openTabs: [...state.openTabs, note] };
    }),

  removeOpenTab: (noteId) =>
    set((state) => ({
      openTabs: state.openTabs.filter((n) => n.id !== noteId),
    })),

  clearOpenTabs: () => set({ openTabs: [] }),

  setAllNotes: (notes) => set({ allNotes: notes }),
}));
