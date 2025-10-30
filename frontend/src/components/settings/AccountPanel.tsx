import { Cloud, CloudOff, Loader2, AlertCircle, CheckCircle2, RefreshCw, LogOut } from 'lucide-react'
import { useSyncStore } from '../../stores/syncStore'
import { cn } from '../../lib/utils'

export function AccountPanel() {
  const {
    isAuthenticated,
    accountInfo,
    syncStatus,
    isSyncing,
    authError,
    syncError,
    startAuth,
    signOut,
    triggerSync
  } = useSyncStore()

  const handleConnect = async () => {
    await startAuth()
  }

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect from Google Drive? Your local notes will remain safe.')) {
      await signOut()
    }
  }

  const handleSyncNow = async () => {
    await triggerSync()
  }

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never'

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Google Drive Sync
        </h2>
        <p className="text-sm text-foreground-muted">
          Connect your Google account to automatically sync your notes
        </p>
      </div>

      {/* Not Authenticated State */}
      {!isAuthenticated && (
        <div className="space-y-4">
          {/* Info Card */}
          <div className={cn(
            "p-6 rounded-lg border border-border",
            "bg-accent/5"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                "bg-accent/10 text-accent"
              )}>
                <Cloud className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Enable Cloud Sync
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  Connect your Google account to automatically backup and sync your notes across devices. Your notes are stored securely in your Google Drive.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className={cn(
              "p-4 rounded-lg border border-error/30",
              "bg-error/10 flex items-start gap-3"
            )}>
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-error font-medium mb-1">
                  Connection Failed
                </p>
                <p className="text-sm text-error/80">
                  {authError}
                </p>
              </div>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className={cn(
              "w-full px-6 py-3 rounded-lg font-medium",
              "bg-accent text-white",
              "hover:bg-accent-hover active:bg-accent-active",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              "flex items-center justify-center gap-3"
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="currentColor" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" opacity="0.7"/>
              <path fill="currentColor" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="currentColor" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" opacity="0.5"/>
              <path fill="currentColor" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" opacity="0.8"/>
            </svg>
            <span>Connect Google Drive</span>
          </button>
        </div>
      )}

      {/* Authenticated State */}
      {isAuthenticated && accountInfo && (
        <div className="space-y-4">
          {/* Account Info Card */}
          <div className={cn(
            "p-6 rounded-lg border border-border",
            "bg-surface-elevated"
          )}>
            <div className="flex items-center gap-4 mb-6">
              {/* Avatar */}
              {accountInfo.photoUrl ? (
                <img
                  src={accountInfo.photoUrl}
                  alt={accountInfo.name}
                  className="w-16 h-16 rounded-full border-2 border-accent"
                />
              ) : (
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "bg-accent text-white font-semibold text-2xl"
                )}>
                  {accountInfo.name?.charAt(0) || accountInfo.email?.charAt(0) || '?'}
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground truncate mb-1">
                  {accountInfo.name || 'Google User'}
                </p>
                <p className="text-sm text-foreground-muted truncate">
                  {accountInfo.email}
                </p>
              </div>

              {/* Connected Badge */}
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                "bg-success/10 text-success border border-success/30"
              )}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </div>
            </div>

            {/* Sync Status */}
            <div className="space-y-3">
              {/* Last Sync */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">Last sync</span>
                <span className="text-foreground font-medium">
                  {formatLastSync(syncStatus.lastSync)}
                </span>
              </div>

              {/* Queue Status */}
              {syncStatus.queueLength > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Pending items</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    "bg-warning/10 text-warning border border-warning/30"
                  )}>
                    {syncStatus.queueLength} item{syncStatus.queueLength !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Processing Status */}
              {syncStatus.processing && (
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}

              {/* Sync Error */}
              {syncError && (
                <div className={cn(
                  "p-3 rounded-lg border border-error/30",
                  "bg-error/10 flex items-start gap-2"
                )}>
                  <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">
                    {syncError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Sync Now Button */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing || syncStatus.processing}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg font-medium",
                "bg-accent text-white",
                "hover:bg-accent-hover active:bg-accent-active",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent",
                "flex items-center justify-center gap-2"
              )}
            >
              {isSyncing || syncStatus.processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync Now</span>
                </>
              )}
            </button>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className={cn(
                "px-4 py-2.5 rounded-lg font-medium",
                "bg-surface-elevated text-error border border-error/30",
                "hover:bg-error/10",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2",
                "flex items-center justify-center gap-2"
              )}
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
