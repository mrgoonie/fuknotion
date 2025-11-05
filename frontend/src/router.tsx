import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { EditorView } from './views/EditorView';
import { SettingsView } from './views/SettingsView';
import { ErrorBoundary } from './components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <EditorView />,
    errorElement: (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
          <a href="/" className="text-blue-500 hover:underline">
            Go back home
          </a>
        </div>
      </div>
    ),
  },
  {
    path: '/settings',
    element: <SettingsView />,
  },
]);

export function Router() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
