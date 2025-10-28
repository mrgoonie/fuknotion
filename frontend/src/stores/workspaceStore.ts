import { create } from "zustand"
import { Workspace } from "../lib/types"
import { ListWorkspaces, CreateWorkspace } from "../../wailsjs/go/main/App"

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
  error: string | null

  // Actions
  loadWorkspaces: () => Promise<void>
  createWorkspace: (name: string) => Promise<void>
  setCurrentWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  loadWorkspaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const workspaces = await ListWorkspaces()
      set({
        workspaces,
        currentWorkspace: workspaces[0] || null,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load workspaces",
        isLoading: false
      })
    }
  },

  createWorkspace: async (name: string) => {
    set({ isLoading: true, error: null })
    try {
      const workspace = await CreateWorkspace(name)
      set(state => ({
        workspaces: [...state.workspaces, workspace],
        currentWorkspace: workspace,
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create workspace",
        isLoading: false
      })
    }
  },

  setCurrentWorkspace: (workspace: Workspace) => {
    set({ currentWorkspace: workspace })
  },
}))
