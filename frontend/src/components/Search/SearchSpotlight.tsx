import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { ResultItem } from './ResultItem';
import type { Note } from '../../types';

// TODO: Import from Wails bindings after running `wails dev` or `wails build`
// import { SearchNotes } from '../../../wailsjs/go/app/App';
declare const SearchNotes: (query: string) => Promise<SearchResult[]>;

interface SearchResult {
  note: Note;
  snippet: string;
  rank: number;
}

interface SearchSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchSpotlight({ isOpen, onClose }: SearchSpotlightProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNote, addOpenTab } = useAppStore();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const searchResults = await SearchNotes(query);
        setResults(searchResults || []);
        setActiveIndex(0);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      handleSelectResult(results[activeIndex].note);
    }
  }, [results, activeIndex, onClose]);

  const handleSelectResult = (note: Note) => {
    setNote(note);
    addOpenTab(note);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-overlay">
      <div className="w-full max-w-2xl bg-bg-primary rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 text-lg border-none outline-none bg-bg-primary text-text-primary"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && query.trim() !== '' && !isLoading && (
            <div className="p-8 text-center text-text-tertiary">
              No results found for "{query}"
            </div>
          )}
          {results.length === 0 && query.trim() === '' && (
            <div className="p-8 text-center text-text-tertiary">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Type to search your notes</p>
            </div>
          )}
          {results.map((result, index) => (
            <ResultItem
              key={result.note.id}
              note={result.note}
              snippet={result.snippet}
              isActive={index === activeIndex}
              onClick={() => handleSelectResult(result.note)}
            />
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-bg-secondary text-xs text-text-tertiary flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-bg-primary border border-border rounded">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-bg-primary border border-border rounded">Enter</kbd> Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-bg-primary border border-border rounded">Esc</kbd> Close
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
