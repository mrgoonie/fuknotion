import { create } from "zustand"
import { Note } from "../lib/types"
import {
  ListNotes,
  CreateNote,
  UpdateNote,
  DeleteNote,
  ToggleFavorite,
  GetNote
} from "../../wailsjs/go/main/App"
import { debounce } from "../lib/utils"

interface NoteState {
  notes: Note[]
  currentNote: Note | null
  isLoading: boolean
  error: string | null
  isDirty: boolean

  // Actions
  loadNotes: (workspaceId: string) => Promise<void>
  createNote: (workspaceId: string, title: string, content: string, parentId?: string) => Promise<Note | null>
  updateNote: (id: string, title: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  setCurrentNote: (note: Note | null) => void
  setDirty: (isDirty: boolean) => void
  autoSave: (id: string, title: string, content: string) => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  isDirty: false,

  loadNotes: async (workspaceId: string) => {
    set({ isLoading: true, error: null })
    try {
      const notes = await ListNotes(workspaceId)
      set({ notes, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load notes",
        isLoading: false
      })
    }
  },

  createNote: async (workspaceId: string, title: string, content: string, parentId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const note = await CreateNote(workspaceId, title, content, parentId || null)
      set(state => ({
        notes: [note, ...state.notes],
        currentNote: note,
        isLoading: false
      }))
      return note
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create note",
        isLoading: false
      })
      return null
    }
  },

  updateNote: async (id: string, title: string, content: string) => {
    try {
      await UpdateNote(id, title, content)
      set(state => ({
        notes: state.notes.map(n =>
          n.id === id
            ? { ...n, title, content, updatedAt: new Date().toISOString() }
            : n
        ),
        currentNote: state.currentNote?.id === id
          ? { ...state.currentNote, title, content, updatedAt: new Date().toISOString() }
          : state.currentNote,
        isDirty: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update note"
      })
    }
  },

  deleteNote: async (id: string) => {
    try {
      await DeleteNote(id)
      set(state => ({
        notes: state.notes.filter(n => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete note"
      })
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      await ToggleFavorite(id)
      set(state => ({
        notes: state.notes.map(n =>
          n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
        ),
        currentNote: state.currentNote?.id === id
          ? { ...state.currentNote, isFavorite: !state.currentNote.isFavorite }
          : state.currentNote
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to toggle favorite"
      })
    }
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note, isDirty: false })
  },

  setDirty: (isDirty: boolean) => {
    set({ isDirty })
  },

  autoSave: debounce(async (id: string, title: string, content: string) => {
    const state = get()
    if (state.isDirty) {
      await state.updateNote(id, title, content)
    }
  }, 2000),
}))
