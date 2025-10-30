import { CheckCircle } from 'lucide-react'
import { useSyncStore } from '../../stores/syncStore'
import { cn } from '../../lib/utils'

interface OnboardingStep2Props {
  onComplete: () => void
}

export function OnboardingStep2({ onComplete }: OnboardingStep2Props) {
  const { accountInfo } = useSyncStore()

  return (
    <div className="flex flex-col items-center justify-center px-8 py-12">
      {/* Success Icon */}
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-8",
        "bg-success/10 text-success"
      )}>
        <CheckCircle className="w-12 h-12" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          You're all set!
        </h2>
        <p className="text-base text-foreground-muted max-w-md">
          Your notes will now sync automatically with Google Drive
        </p>
      </div>

      {/* Account Info */}
      {accountInfo && (
        <div className={cn(
          "w-full max-w-md mb-8 p-6 rounded-lg",
          "bg-surface-elevated border border-border",
          "flex items-center gap-4"
        )}>
          {/* Avatar */}
          {accountInfo.photoUrl ? (
            <img
              src={accountInfo.photoUrl}
              alt={accountInfo.name}
              className="w-12 h-12 rounded-full border-2 border-accent"
            />
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "bg-accent text-white font-semibold text-lg"
            )}>
              {accountInfo.name?.charAt(0) || accountInfo.email?.charAt(0) || '?'}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {accountInfo.name || 'Google User'}
            </p>
            <p className="text-sm text-foreground-muted truncate">
              {accountInfo.email}
            </p>
          </div>

          {/* Success Badge */}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            "bg-success/10 text-success border border-success/30"
          )}>
            Connected
          </div>
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={onComplete}
        className={cn(
          "px-8 py-3 rounded-lg font-medium",
          "bg-accent text-white",
          "hover:bg-accent-hover active:bg-accent-active",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        )}
      >
        Start Using Fuknotion
      </button>
    </div>
  )
}
