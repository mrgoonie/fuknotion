import { useEffect, useState } from 'react'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'
import { Editor } from './Editor'
import { OnboardingWizard } from './onboarding'
import { SettingsModal } from './settings'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import { useSyncStore } from '../stores/syncStore'
import { cn } from '../lib/utils'
import { Loader2 } from 'lucide-react'

export function MainLayout() {
  const { loadWorkspaces, currentWorkspace, isLoading: isLoadingWorkspaces } = useWorkspaceStore()
  const { loadNotes, isLoading: isLoadingNotes } = useNoteStore()
  const { theme } = useUIStore()
  const { checkAuth, isAuthenticated, showOnboarding, setShowOnboarding } = useSyncStore()
  const [showSettings, setShowSettings] = useState(false)

  // Load initial data on mount
  useEffect(() => {
    const initializeApp = async () => {
      await loadWorkspaces()
      await checkAuth()

      // Show onboarding if not authenticated and not dismissed
      if (!isAuthenticated && !localStorage.getItem('onboarding_dismissed')) {
        setShowOnboarding(true)
      }
    }
    initializeApp()
  }, [loadWorkspaces, checkAuth, isAuthenticated, setShowOnboarding])

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
    <>
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        {/* Title Bar */}
        <TitleBar onSettingsClick={() => setShowSettings(true)} />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar onSettingsClick={() => setShowSettings(true)} />

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

      {/* Onboarding Wizard */}
      <OnboardingWizard />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        defaultTab="account"
      />
    </>
  )
}
