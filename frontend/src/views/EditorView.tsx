import { useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { BlockNoteEditor } from '../components/Editor/BlockNoteEditor';
import { EditableTitle } from '../components/Editor/EditableTitle';
import { updateNote } from '../services/noteService';
import { extractFrontmatter, addFrontmatter } from '../utils/blockNoteMarkdown';

export function EditorView() {
  const { currentNote, setNote } = useAppStore();

  const handleSave = useCallback(async (content: string) => {
    if (!currentNote) return;

    try {
      // Extract frontmatter from original content
      const frontmatter = extractFrontmatter(currentNote.content);

      // If there's frontmatter, preserve it; otherwise create basic frontmatter
      const fullContent = frontmatter ? addFrontmatter(frontmatter, content) : content;

      // Update note in backend
      await updateNote(currentNote.id, currentNote.title, fullContent);

      // Update local state
      setNote({
        ...currentNote,
        content: fullContent,
        updatedAt: new Date().toISOString(),
      });

      console.log('Note saved successfully');
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }, [currentNote, setNote]);

  const handleTitleSave = useCallback(async (newTitle: string) => {
    if (!currentNote) return;

    try {
      // Update note with new title
      await updateNote(currentNote.id, newTitle, currentNote.content);

      // Update local state
      setNote({
        ...currentNote,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });

      console.log('Title saved successfully');
    } catch (error) {
      console.error('Failed to save title:', error);
      throw error; // Re-throw to let EditableTitle handle it
    }
  }, [currentNote, setNote]);

  return (
    <div className="h-full flex flex-col">
      {currentNote ? (
        <div className="h-full flex flex-col">
          {/* Note header */}
          <div className="border-b border-border px-8 py-6">
            <EditableTitle
              title={currentNote.title}
              onSave={handleTitleSave}
            />
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <BlockNoteEditor
              noteId={currentNote.id}
              initialContent={currentNote.content}
              onSave={handleSave}
            />
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-text-secondary">
          <div className="text-center">
            <p className="text-xl mb-2">No note selected</p>
            <p className="text-sm">
              Select a note from the sidebar or create a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
