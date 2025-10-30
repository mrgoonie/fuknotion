import { Moon, Sun, Monitor, Minus, Square, X } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import { SyncStatusBadge } from './SyncStatusBadge'
import { cn } from '../lib/utils'

interface TitleBarProps {
  onSettingsClick?: () => void
}

export function TitleBar({ onSettingsClick }: TitleBarProps) {
  const { theme, setTheme } = useUIStore()

  const handleMinimize = () => {
    // @ts-ignore - Wails runtime
    window.runtime?.WindowMinimise()
  }

  const handleMaximize = () => {
    // @ts-ignore - Wails runtime
    window.runtime?.WindowToggleMaximise()
  }

  const handleClose = () => {
    // @ts-ignore - Wails runtime
    window.runtime?.Quit()
  }

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  return (
    <div className="h-12 bg-surface border-b border-border flex items-center justify-between px-4 select-none">
      {/* Left: Logo & Title (Draggable) */}
      <div
        className="flex items-center gap-3 flex-1 --wails-draggable"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-white text-xs font-bold">
          F
        </div>
        <span className="text-sm font-semibold text-foreground">Fuknotion</span>
      </div>

      {/* Center: Empty (for future features) */}
      <div className="flex-1" />

      {/* Right: Sync Badge + Theme Toggle + Window Controls */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Sync Status Badge */}
        {onSettingsClick && (
          <SyncStatusBadge onClick={onSettingsClick} className="mr-1" />
        )}

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center",
            "hover:bg-surface-elevated transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          )}
          aria-label="Toggle theme"
          title={`Current: ${theme}`}
        >
          {theme === 'light' && <Sun className="w-4 h-4 text-foreground-muted" />}
          {theme === 'dark' && <Moon className="w-4 h-4 text-foreground-muted" />}
          {theme === 'system' && <Monitor className="w-4 h-4 text-foreground-muted" />}
        </button>

        {/* Window Controls */}
        <div className="flex items-center ml-2">
          <button
            onClick={handleMinimize}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              "hover:bg-surface-elevated transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            )}
            aria-label="Minimize window"
          >
            <Minus className="w-4 h-4 text-foreground-muted" />
          </button>
          <button
            onClick={handleMaximize}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              "hover:bg-surface-elevated transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            )}
            aria-label="Maximize window"
          >
            <Square className="w-3 h-3 text-foreground-muted" />
          </button>
          <button
            onClick={handleClose}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              "hover:bg-error hover:text-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            )}
            aria-label="Close window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
