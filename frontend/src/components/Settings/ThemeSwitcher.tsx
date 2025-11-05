import { useTheme } from '../../hooks/useTheme';
import type { ThemeMode } from '../../types/theme';

export function ThemeSwitcher() {
  const { mode, setTheme } = useTheme();

  const themes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'system', label: 'System', icon: '💻' },
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
  ];

  return (
    <div className="space-y-2" role="radiogroup" aria-label="Theme selection">
      <h3 className="text-sm font-medium text-text-primary">Theme</h3>
      <div className="flex gap-2">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            role="radio"
            aria-checked={mode === theme.value}
            className={`
              flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
              ${
                mode === theme.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-hover'
              }
            `}
          >
            <span className="mr-1">{theme.icon}</span>
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}
