import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types';

interface UIState {
  // Sidebar state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // Theme
  theme: Theme;

  // Actions
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      leftSidebarOpen: true,
      rightSidebarOpen: false,
      theme: 'system',

      toggleLeftSidebar: () =>
        set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),

      toggleRightSidebar: () =>
        set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

      setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),

      setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'fuknotion-ui-storage', // localStorage key
    }
  )
);
