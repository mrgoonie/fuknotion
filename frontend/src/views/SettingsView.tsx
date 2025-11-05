import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { Theme } from '../types';

export function SettingsView() {
  const navigate = useNavigate();
  const { theme, setTheme } = useUIStore();

  const themes: Theme[] = ['light', 'dark', 'system'];

  return (
    <div className="h-full p-8 bg-bg-primary">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
          aria-label="Back to editor"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
      </div>

      <div className="bg-bg-secondary rounded-lg border border-border p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Appearance</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="block w-full px-3 py-2 bg-bg-primary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-sm text-text-secondary">
              Choose your preferred color theme
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Editor</h2>
          <p className="text-text-secondary">Editor settings coming in Phase 06</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Sync</h2>
          <p className="text-text-secondary">
            Google Drive sync settings coming in Phase 12
          </p>
        </div>
      </div>
    </div>
  );
}
