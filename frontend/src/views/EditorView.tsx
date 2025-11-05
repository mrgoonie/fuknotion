import { useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { BlockNoteEditor } from '../components/Editor/BlockNoteEditor';
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

  return (
    <div className="h-full flex flex-col">
      {currentNote ? (
        <div className="h-full flex flex-col">
          {/* Note header */}
          <div className="border-b px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentNote.title}
            </h1>
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
        <div className="h-full flex items-center justify-center text-gray-500">
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
