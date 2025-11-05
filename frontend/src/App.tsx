import { useState, useEffect } from 'react';
import { Router } from './router';
import { SearchSpotlight } from './components/Search/SearchSpotlight';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/Auth/LoginScreen';

function AppContent() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Global keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-accent mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show main app if authenticated
  return (
    <>
      <Router />
      <SearchSpotlight isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
