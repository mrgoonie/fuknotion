import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

export function GeneralPanel() {
  const { theme, setTheme } = useUIStore()

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          General Settings
        </h2>
        <p className="text-sm text-foreground-muted">
          Customize your Fuknotion experience
        </p>
      </div>

      {/* Theme Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Appearance
          </h3>
          <p className="text-sm text-foreground-muted">
            Select your preferred theme
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-200",
                "hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                theme === value
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface-elevated hover:border-accent/30"
              )}
            >
              {/* Selected Indicator */}
              {theme === value && (
                <div className={cn(
                  "absolute top-2 right-2 w-5 h-5 rounded-full",
                  "bg-accent text-white flex items-center justify-center"
                )}>
                  <Check className="w-3 h-3" />
                </div>
              )}

              {/* Icon */}
              <Icon className={cn(
                "w-8 h-8 mx-auto mb-2",
                theme === value ? "text-accent" : "text-foreground-muted"
              )} />

              {/* Label */}
              <p className={cn(
                "text-sm font-medium text-center",
                theme === value ? "text-accent" : "text-foreground"
              )}>
                {label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* App Version */}
      <div className="pt-6 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              App Version
            </h3>
            <p className="text-sm text-foreground-muted">
              Fuknotion v1.0.0
            </p>
          </div>
          <button
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm",
              "bg-surface-elevated border border-border",
              "hover:bg-accent hover:text-white hover:border-accent",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            )}
          >
            Check for Updates
          </button>
        </div>
      </div>

      {/* Language (Placeholder) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Language
          </h3>
          <p className="text-sm text-foreground-muted">
            Select your preferred language
          </p>
        </div>

        <select
          disabled
          className={cn(
            "w-full px-4 py-2.5 rounded-lg",
            "bg-surface-elevated border border-border",
            "text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <option>English (Coming soon)</option>
        </select>
      </div>
    </div>
  )
}
