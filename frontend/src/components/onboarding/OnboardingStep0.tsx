import { Cloud, Shield, Zap } from 'lucide-react'
import { cn } from '../../lib/utils'

interface OnboardingStep0Props {
  onNext: () => void
}

export function OnboardingStep0({ onNext }: OnboardingStep0Props) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome to Fuknotion
        </h1>
        <p className="text-lg text-foreground-muted max-w-md">
          Your notes, synced with Google Drive
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
        {/* Automatic Sync */}
        <div
          className={cn(
            "flex flex-col items-center text-center p-6 rounded-lg",
            "bg-surface-elevated border border-border",
            "transition-all duration-200",
            "hover:shadow-md hover:border-accent/30"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-accent/10 text-accent"
          )}>
            <Cloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Automatic Sync
          </h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Your notes are automatically synced to Google Drive in real-time
          </p>
        </div>

        {/* Secure Storage */}
        <div
          className={cn(
            "flex flex-col items-center text-center p-6 rounded-lg",
            "bg-surface-elevated border border-border",
            "transition-all duration-200",
            "hover:shadow-md hover:border-accent/30"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-success/10 text-success"
          )}>
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Secure Storage
          </h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Your data is encrypted and stored securely in your Google account
          </p>
        </div>

        {/* Offline First */}
        <div
          className={cn(
            "flex flex-col items-center text-center p-6 rounded-lg",
            "bg-surface-elevated border border-border",
            "transition-all duration-200",
            "hover:shadow-md hover:border-accent/30"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-warning/10 text-warning"
          )}>
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Offline First
          </h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Work offline seamlessly, sync automatically when you're back online
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className={cn(
          "px-8 py-3 rounded-lg font-medium",
          "bg-accent text-white",
          "hover:bg-accent-hover active:bg-accent-active",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        )}
      >
        Get Started
      </button>
    </div>
  )
}
