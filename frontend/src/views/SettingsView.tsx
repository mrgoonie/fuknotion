import { useUIStore } from '../stores/uiStore';
import { Theme } from '../types';

export function SettingsView() {
  const { theme, setTheme } = useUIStore();

  const themes: Theme[] = ['light', 'dark', 'system'];

  return (
    <div className="h-full p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              Choose your preferred color theme
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Editor</h2>
          <p className="text-gray-600">Editor settings coming in Phase 06</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Sync</h2>
          <p className="text-gray-600">
            Google Drive sync settings coming in Phase 12
          </p>
        </div>
      </div>
    </div>
  );
}
