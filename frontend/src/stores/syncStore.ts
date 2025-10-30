import { create } from 'zustand'
import {
  StartDriveAuth,
  SignOutDrive,
  GetDriveAccountInfo,
  IsDriveAuthenticated,
  GetSyncStatus,
  TriggerSync
} from '../../wailsjs/go/main/App'

export interface GoogleAccountInfo {
  email: string
  name: string
  photoUrl: string
  authorized: boolean
}

export interface SyncStatus {
  queueLength: number
  processing: boolean
  authenticated: boolean
  lastSync?: string
}

interface SyncState {
  // Auth state
  isAuthenticated: boolean
  isAuthenticating: boolean
  accountInfo: GoogleAccountInfo | null
  authError: string | null

  // Sync state
  syncStatus: SyncStatus
  isSyncing: boolean
  syncError: string | null

  // Onboarding state
  showOnboarding: boolean
  onboardingStep: number

  // Actions
  checkAuth: () => Promise<void>
  startAuth: () => Promise<void>
  signOut: () => Promise<void>
  fetchAccountInfo: () => Promise<void>
  fetchSyncStatus: () => Promise<void>
  triggerSync: () => Promise<void>

  // Onboarding actions
  setShowOnboarding: (show: boolean) => void
  setOnboardingStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isAuthenticating: false,
  accountInfo: null,
  authError: null,
  syncStatus: {
    queueLength: 0,
    processing: false,
    authenticated: false,
  },
  isSyncing: false,
  syncError: null,
  showOnboarding: false,
  onboardingStep: 0,

  // Check authentication status
  checkAuth: async () => {
    try {
      const isAuth = await IsDriveAuthenticated()
      set({ isAuthenticated: isAuth, authError: null })

      if (isAuth) {
        await get().fetchAccountInfo()
        await get().fetchSyncStatus()
      }
    } catch (error) {
      console.error('Failed to check auth:', error)
      set({ authError: error instanceof Error ? error.message : 'Failed to check authentication' })
    }
  },

  // Start OAuth authentication flow
  startAuth: async () => {
    set({ isAuthenticating: true, authError: null })

    try {
      const authURL = await StartDriveAuth()

      // Open auth URL in system browser
      window.open(authURL, '_blank')

      // Poll for authentication status
      const pollInterval = setInterval(async () => {
        try {
          const isAuth = await IsDriveAuthenticated()

          if (isAuth) {
            clearInterval(pollInterval)
            set({ isAuthenticated: true, isAuthenticating: false })
            await get().fetchAccountInfo()
            await get().fetchSyncStatus()

            // Close onboarding if open
            if (get().showOnboarding) {
              set({ showOnboarding: false, onboardingStep: 0 })
            }
          }
        } catch (error) {
          console.error('Poll error:', error)
        }
      }, 1000) // Poll every second

      // Stop polling after 2 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval)
        if (!get().isAuthenticated) {
          set({
            isAuthenticating: false,
            authError: 'Authentication timeout. Please try again.'
          })
        }
      }, 120000) // 2 minutes

    } catch (error) {
      console.error('Failed to start auth:', error)
      set({
        isAuthenticating: false,
        authError: error instanceof Error ? error.message : 'Failed to start authentication'
      })
    }
  },

  // Sign out from Google Drive
  signOut: async () => {
    try {
      await SignOutDrive()
      set({
        isAuthenticated: false,
        accountInfo: null,
        authError: null,
        syncStatus: {
          queueLength: 0,
          processing: false,
          authenticated: false,
        }
      })
    } catch (error) {
      console.error('Failed to sign out:', error)
      set({ authError: error instanceof Error ? error.message : 'Failed to sign out' })
    }
  },

  // Fetch account information
  fetchAccountInfo: async () => {
    try {
      const info = await GetDriveAccountInfo()
      set({ accountInfo: info as GoogleAccountInfo, authError: null })
    } catch (error) {
      console.error('Failed to fetch account info:', error)
      set({ authError: error instanceof Error ? error.message : 'Failed to fetch account info' })
    }
  },

  // Fetch sync status
  fetchSyncStatus: async () => {
    try {
      const status = await GetSyncStatus()
      set({ syncStatus: status as SyncStatus, syncError: null })
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
      set({ syncError: error instanceof Error ? error.message : 'Failed to fetch sync status' })
    }
  },

  // Trigger manual sync
  triggerSync: async () => {
    set({ isSyncing: true, syncError: null })

    try {
      await TriggerSync()
      await get().fetchSyncStatus()
      set({ isSyncing: false })
    } catch (error) {
      console.error('Failed to trigger sync:', error)
      set({
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to sync'
      })
    }
  },

  // Onboarding actions
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  nextStep: () => set((state) => ({ onboardingStep: Math.min(state.onboardingStep + 1, 2) })),
  prevStep: () => set((state) => ({ onboardingStep: Math.max(state.onboardingStep - 1, 0) })),
}))
