import { useEffect } from 'react'
import { Cloud, CloudOff, CloudCheck, Loader2, AlertCircle } from 'lucide-react'
import { useSyncStore } from '../stores/syncStore'
import { cn } from '../lib/utils'

interface SyncStatusBadgeProps {
  onClick?: () => void
  className?: string
}

export function SyncStatusBadge({ onClick, className }: SyncStatusBadgeProps) {
  const {
    isAuthenticated,
    syncStatus,
    isSyncing,
    syncError,
    checkAuth,
    fetchSyncStatus
  } = useSyncStore()

  // Initial auth check
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Poll sync status every 10 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      fetchSyncStatus()
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchSyncStatus])

  // Determine status
  const getStatus = () => {
    if (!isAuthenticated) {
      return {
        icon: CloudOff,
        color: 'text-foreground-subtle',
        bgColor: 'bg-surface-elevated',
        label: 'Not connected',
        pulse: false
      }
    }

    if (syncError) {
      return {
        icon: AlertCircle,
        color: 'text-error',
        bgColor: 'bg-error/10',
        label: 'Sync error',
        pulse: false
      }
    }

    if (isSyncing || syncStatus.processing) {
      return {
        icon: Loader2,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        label: 'Syncing...',
        pulse: true
      }
    }

    if (syncStatus.queueLength > 0) {
      return {
        icon: Cloud,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        label: `${syncStatus.queueLength} pending`,
        pulse: false
      }
    }

    return {
      icon: CloudCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Synced',
      pulse: false
    }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group px-3 py-2 rounded-lg",
        "flex items-center gap-2",
        "transition-all duration-200",
        "hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        status.bgColor,
        className
      )}
      title={status.label}
      aria-label={status.label}
    >
      {/* Icon */}
      <div className="relative">
        <Icon
          className={cn(
            "w-4 h-4 transition-colors",
            status.color,
            status.icon === Loader2 && "animate-spin"
          )}
        />

        {/* Pulse Animation */}
        {status.pulse && (
          <span className={cn(
            "absolute inset-0 rounded-full",
            "animate-ping opacity-75",
            status.bgColor
          )} />
        )}
      </div>

      {/* Label (hidden on small screens, shown on hover/focus on larger screens) */}
      <span className={cn(
        "text-xs font-medium transition-all",
        "hidden sm:inline-block",
        "group-hover:inline-block",
        status.color
      )}>
        {status.label}
      </span>

      {/* Tooltip (for mobile/small screens) */}
      <span className={cn(
        "absolute left-1/2 -translate-x-1/2 bottom-full mb-2",
        "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
        "bg-surface-elevated border border-border shadow-lg",
        "text-foreground",
        "opacity-0 group-hover:opacity-100 sm:group-hover:opacity-0",
        "transition-opacity duration-200 pointer-events-none",
        "z-10"
      )}>
        {status.label}
      </span>
    </button>
  )
}
