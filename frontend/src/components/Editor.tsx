import { useEffect, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import './editor-overrides.css'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import { cn } from '../lib/utils'
import { Loader2, Save, Check } from 'lucide-react'

export function Editor() {
  const { currentNote, isDirty, setDirty, autoSave } = useNoteStore()
  const { theme } = useUIStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Initialize BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: currentNote?.content
      ? JSON.parse(currentNote.content)
      : undefined,
  })

  // Update editor content when current note changes
  useEffect(() => {
    if (currentNote && editor) {
      setIsInitializing(true)
      try {
        const content = currentNote.content
          ? JSON.parse(currentNote.content)
          : []
        editor.replaceBlocks(editor.document, content)
      } catch (error) {
        console.error('Failed to parse note content:', error)
      } finally {
        setIsInitializing(false)
      }
    }
  }, [currentNote?.id, editor])

  // Handle editor changes
  const handleChange = () => {
    if (!currentNote || isInitializing) return

    setDirty(true)
    setSaveStatus('idle')

    // Get current content
    const content = JSON.stringify(editor.document)

    // Trigger auto-save
    setSaveStatus('saving')
    autoSave(currentNote.id, currentNote.title, content)

    // Show saved indicator
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    }, 2000)
  }

  // No note selected
  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-surface flex items-center justify-center">
            <svg
              className="w-8 h-8 text-foreground-subtle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No page selected
          </h3>
          <p className="text-sm text-foreground-muted">
            Select a page from the sidebar or create a new one
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background overflow-auto">
      <div className="max-w-[740px] mx-auto py-8 px-12">
        {/* Save Indicator */}
        {saveStatus !== 'idle' && (
          <div className="fixed top-16 right-8 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border shadow-md text-sm text-foreground-muted">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-4 h-4 text-success" />
                <span>Saved</span>
              </>
            )}
          </div>
        )}

        {/* Editor Title */}
        <input
          type="text"
          value={currentNote.title}
          onChange={(e) => {
            const newTitle = e.target.value
            setDirty(true)
            // Trigger auto-save with title change
            autoSave(currentNote.id, newTitle, JSON.stringify(editor.document))
          }}
          placeholder="Untitled"
          className={cn(
            "w-full mb-4 px-0 text-4xl font-bold text-foreground",
            "bg-transparent border-none outline-none",
            "placeholder:text-muted-foreground"
          )}
        />

        {/* BlockNote Editor */}
        <div className={cn(
          "blocknote-editor",
          theme === 'dark' && 'dark-theme'
        )}>
          <BlockNoteView
            editor={editor}
            theme={theme === 'dark' ? 'dark' : 'light'}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  )
}
