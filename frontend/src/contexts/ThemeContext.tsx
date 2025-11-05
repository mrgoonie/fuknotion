import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ThemeMode, ThemeContextValue } from '../types/theme';

const THEME_STORAGE_KEY = 'fuknotion-theme';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Get saved preference or default to system (with validation)
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const validModes: ThemeMode[] = ['system', 'light', 'dark'];
    return validModes.includes(saved as ThemeMode) ? (saved as ThemeMode) : 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    // Check if dark mode is already applied (from inline script)
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  });

  // Detect system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setResolvedTheme(theme);
  }, []);

  // Set theme mode
  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);

    // Apply resolved theme immediately
    if (newMode === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(newMode);
    }
  }, [applyTheme, getSystemTheme]);

  // Listen to system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, applyTheme]);

  // Apply theme on mount and mode change
  useEffect(() => {
    if (mode === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(mode);
    }
  }, [mode, applyTheme, getSystemTheme]);

  const value: ThemeContextValue = {
    mode,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
