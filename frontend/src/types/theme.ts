export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}
