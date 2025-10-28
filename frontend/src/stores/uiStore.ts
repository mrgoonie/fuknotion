import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Tab } from "../lib/types"

interface UIState {
  theme: "light" | "dark" | "system"
  isSidebarCollapsed: boolean
  tabs: Tab[]
  activeTabId: string | null

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleSidebar: () => void
  addTab: (tab: Tab) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (startIndex: number, endIndex: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "system",
      isSidebarCollapsed: false,
      tabs: [],
      activeTabId: null,

      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        const root = document.documentElement
        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          root.classList.toggle("dark", systemTheme === "dark")
        } else {
          root.classList.toggle("dark", theme === "dark")
        }
      },

      toggleSidebar: () => {
        set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
      },

      addTab: (tab) => {
        set(state => {
          // Check if tab already exists
          const exists = state.tabs.find(t => t.noteId === tab.noteId)
          if (exists) {
            return { activeTabId: exists.id }
          }
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id
          }
        })
      },

      removeTab: (tabId) => {
        set(state => {
          const newTabs = state.tabs.filter(t => t.id !== tabId)
          const activeTab = state.activeTabId === tabId
            ? newTabs[newTabs.length - 1]?.id || null
            : state.activeTabId
          return {
            tabs: newTabs,
            activeTabId: activeTab
          }
        })
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId })
      },

      reorderTabs: (startIndex, endIndex) => {
        set(state => {
          const tabs = [...state.tabs]
          const [removed] = tabs.splice(startIndex, 1)
          tabs.splice(endIndex, 0, removed)
          return { tabs }
        })
      },
    }),
    {
      name: "fuknotion-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed
      }),
    }
  )
)
