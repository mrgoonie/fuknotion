import { useUIStore } from '../../stores/uiStore';
import { useAppStore } from '../../stores/appStore';
import { MetadataPanel } from './MetadataPanel';
import { TOCPanel } from './TOCPanel';
import { ThemeSwitcher } from '../Settings/ThemeSwitcher';

export function RightSidebar() {
  const { rightSidebarOpen, toggleRightSidebar } = useUIStore();
  const { currentNote } = useAppStore();

  if (!rightSidebarOpen) {
    return (
      <div className="flex items-center justify-center w-12 border-l border-border bg-bg-secondary">
        <button
          onClick={toggleRightSidebar}
          className="p-2 hover:bg-bg-hover rounded"
          aria-label="Open right sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="w-64 border-l border-border bg-bg-secondary flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Properties</h3>
          <button
            onClick={toggleRightSidebar}
            className="p-1 hover:bg-bg-hover rounded"
            aria-label="Close right sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-text-tertiary text-sm text-center">
          Select a note to view properties
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l border-border bg-bg-secondary flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-text-primary">Properties</h3>
        <button
          onClick={toggleRightSidebar}
          className="p-1 hover:bg-bg-hover rounded"
          aria-label="Close right sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <MetadataPanel note={currentNote} />
        <TOCPanel content={currentNote.content} />

        {/* Theme Switcher */}
        <div className="p-4 border-t border-border">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
