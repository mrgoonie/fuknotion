import { useEffect } from 'react'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'
import { Editor } from './Editor'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import { cn } from '../lib/utils'
import { Loader2 } from 'lucide-react'

export function MainLayout() {
  const { loadWorkspaces, currentWorkspace, isLoading: isLoadingWorkspaces } = useWorkspaceStore()
  const { loadNotes, isLoading: isLoadingNotes } = useNoteStore()
  const { theme } = useUIStore()

  // Load initial data on mount
  useEffect(() => {
    const initializeApp = async () => {
      await loadWorkspaces()
    }
    initializeApp()
  }, [loadWorkspaces])

  // Load notes when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadNotes(currentWorkspace.id)
    }
  }, [currentWorkspace?.id, loadNotes])

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        root.classList.toggle('dark', e.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Show loading state
  if (isLoadingWorkspaces) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-accent animate-spin" />
          <p className="text-sm text-foreground-muted">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <TabBar />

          {/* Editor */}
          {isLoadingNotes ? (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 text-accent animate-spin" />
                <p className="text-sm text-foreground-muted">Loading notes...</p>
              </div>
            </div>
          ) : (
            <Editor />
          )}
        </div>
      </div>
    </div>
  )
}
