import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleSignIn, GetCurrentUser, IsAuthenticated, Logout } from '../../wailsjs/go/app/App';
import { app } from '../../wailsjs/go/models';

export type UserInfo = app.UserInfo;

interface AuthContextValue {
  user: UserInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if authenticated
      const authenticated = await IsAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Load user info
        const currentUser = await GetCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start Google OAuth flow
      await GoogleSignIn();

      // Reload user info
      await checkAuth();
    } catch (err) {
      console.error('Sign in failed:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await Logout();

      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
