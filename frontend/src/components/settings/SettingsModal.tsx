import { useEffect, useState } from 'react'
import { X, User, Settings as SettingsIcon, Info } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AccountPanel } from './AccountPanel'
import { GeneralPanel } from './GeneralPanel'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'general' | 'account' | 'about'
}

type TabType = 'general' | 'account' | 'about'

export function SettingsModal({ isOpen, onClose, defaultTab = 'general' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset to default tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
    }
  }, [isOpen, defaultTab])

  if (!isOpen) return null

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: SettingsIcon },
    { id: 'account' as TabType, label: 'Account', icon: User },
    { id: 'about' as TabType, label: 'About', icon: Info },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-4xl h-[600px] mx-4 rounded-xl overflow-hidden",
          "bg-background border border-border shadow-2xl",
          "animate-in zoom-in-95 duration-300",
          "flex"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className={cn(
          "w-56 bg-surface border-r border-border",
          "flex flex-col"
        )}>
          {/* Header */}
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-lg font-semibold text-foreground">
              Settings
            </h2>
          </div>

          {/* Tabs */}
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg flex items-center gap-3",
                  "text-sm font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                  activeTab === id
                    ? "bg-accent/10 text-accent border-l-3 border-accent"
                    : "text-foreground-muted hover:bg-surface-elevated hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header with Close Button */}
          <div className="flex items-center justify-end p-4 border-b border-border-subtle">
            <button
              onClick={onClose}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "hover:bg-surface-elevated transition-colors",
                "text-foreground-muted hover:text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              )}
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'general' && <GeneralPanel />}
            {activeTab === 'account' && <AccountPanel />}
            {activeTab === 'about' && <AboutPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}

// About Panel (placeholder)
function AboutPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          About Fuknotion
        </h2>
        <p className="text-sm text-foreground-muted">
          A Notion-like note-taking desktop app
        </p>
      </div>

      <div className={cn(
        "p-6 rounded-lg border border-border",
        "bg-surface-elevated space-y-4"
      )}>
        <div>
          <p className="text-sm font-medium text-foreground-muted mb-1">Version</p>
          <p className="text-base text-foreground">1.0.0</p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground-muted mb-1">Built with</p>
          <p className="text-base text-foreground">Wails, React, TypeScript, Go</p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground-muted mb-1">License</p>
          <p className="text-base text-foreground">MIT License</p>
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle">
        <p className="text-sm text-foreground-muted text-center">
          Made with ❤️ for productivity enthusiasts
        </p>
      </div>
    </div>
  )
}
