import { Loader2, AlertCircle } from 'lucide-react'
import { useSyncStore } from '../../stores/syncStore'
import { cn } from '../../lib/utils'

interface OnboardingStep1Props {
  onSkip: () => void
}

export function OnboardingStep1({ onSkip }: OnboardingStep1Props) {
  const { isAuthenticating, authError, startAuth } = useSyncStore()

  const handleSignIn = async () => {
    await startAuth()
  }

  return (
    <div className="flex flex-col items-center justify-center px-8 py-12">
      {/* Google Logo */}
      <div className="mb-8">
        <svg className="w-16 h-16" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Connect Google Drive
        </h2>
        <p className="text-base text-foreground-muted max-w-md">
          Sign in with your Google account to enable automatic sync
        </p>
      </div>

      {/* Error Message */}
      {authError && (
        <div className={cn(
          "w-full max-w-md mb-6 p-4 rounded-lg",
          "bg-error/10 border border-error/30",
          "flex items-start gap-3"
        )}>
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-error font-medium mb-1">
              Authentication Failed
            </p>
            <p className="text-sm text-error/80">
              {authError}
            </p>
          </div>
        </div>
      )}

      {/* Sign In Button */}
      <button
        onClick={handleSignIn}
        disabled={isAuthenticating}
        className={cn(
          "w-full max-w-md px-6 py-3 rounded-lg font-medium",
          "bg-white text-foreground border-2 border-border",
          "hover:bg-surface-elevated hover:shadow-md",
          "active:scale-[0.98]",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none",
          "flex items-center justify-center gap-3"
        )}
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>

      {/* Skip Link */}
      <button
        onClick={onSkip}
        className={cn(
          "mt-6 text-sm text-foreground-muted hover:text-foreground",
          "underline underline-offset-4",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-2 py-1"
        )}
      >
        Skip for now
      </button>
    </div>
  )
}
