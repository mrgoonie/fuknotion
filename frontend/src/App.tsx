import { useState, useEffect } from 'react';
import { Router } from './router';
import { SearchSpotlight } from './components/Search/SearchSpotlight';

function App() {
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
      <Router />
      <SearchSpotlight isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default App;
