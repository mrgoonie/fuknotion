import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { SearchBox } from './SearchBox';
import { FavoritesSection } from './FavoritesSection';
import { FoldersTree } from './FoldersTree';

export function LeftSidebar() {
  const { leftSidebarOpen, toggleLeftSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (!leftSidebarOpen) {
    return (
      <div className="flex items-center justify-center w-12 border-r bg-gray-50">
        <button
          onClick={toggleLeftSidebar}
          className="p-2 hover:bg-gray-200 rounded"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Fuknotion</h2>
        <button
          onClick={toggleLeftSidebar}
          className="p-1 hover:bg-gray-200 rounded"
          aria-label="Close sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <SearchBox value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-3">
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites */}
        <FavoritesSection searchQuery={searchQuery} />

        {/* Folders */}
        <FoldersTree searchQuery={searchQuery} />
      </div>

      {/* Footer Actions */}
      <div className="border-t p-3 space-y-1">
        <button className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-200 rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        <button className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-200 rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Trash
        </button>
      </div>
    </div>
  );
}
