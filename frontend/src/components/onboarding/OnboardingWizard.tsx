import { useEffect } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { useSyncStore } from '../../stores/syncStore'
import { cn } from '../../lib/utils'
import { OnboardingStep0 } from './OnboardingStep0'
import { OnboardingStep1 } from './OnboardingStep1'
import { OnboardingStep2 } from './OnboardingStep2'

export function OnboardingWizard() {
  const {
    showOnboarding,
    onboardingStep,
    isAuthenticated,
    setShowOnboarding,
    setOnboardingStep,
    nextStep,
    prevStep
  } = useSyncStore()

  // Auto-advance to step 2 when authentication completes
  useEffect(() => {
    if (isAuthenticated && onboardingStep === 1) {
      setOnboardingStep(2)
    }
  }, [isAuthenticated, onboardingStep, setOnboardingStep])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showOnboarding) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showOnboarding])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOnboarding) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showOnboarding])

  const handleClose = () => {
    setShowOnboarding(false)
    setOnboardingStep(0)
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleComplete = () => {
    handleClose()
  }

  // Early return after all hooks to maintain hooks consistency
  if (!showOnboarding) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-4xl mx-4 rounded-xl",
          "bg-background border border-border shadow-2xl",
          "animate-in zoom-in-95 duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6">
          {/* Back Button */}
          {onboardingStep > 0 && onboardingStep < 2 && (
            <button
              onClick={prevStep}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "hover:bg-surface-elevated transition-colors",
                "text-foreground-muted hover:text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              )}
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "hover:bg-surface-elevated transition-colors",
              "text-foreground-muted hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            )}
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-16">
          {onboardingStep === 0 && <OnboardingStep0 onNext={nextStep} />}
          {onboardingStep === 1 && <OnboardingStep1 onSkip={handleSkip} />}
          {onboardingStep === 2 && <OnboardingStep2 onComplete={handleComplete} />}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 pb-8">
          {[0, 1, 2].map((step) => (
            <button
              key={step}
              onClick={() => {
                // Allow clicking on previous steps
                if (step < onboardingStep) {
                  setOnboardingStep(step)
                }
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                onboardingStep === step
                  ? "bg-accent w-8"
                  : step < onboardingStep
                  ? "bg-accent/50 hover:bg-accent/70 cursor-pointer"
                  : "bg-border"
              )}
              aria-label={`Step ${step + 1}`}
              disabled={step > onboardingStep}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
