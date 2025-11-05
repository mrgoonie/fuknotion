import { useEffect, useState } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { stripFrontmatter } from '../../utils/blockNoteMarkdown';

interface BlockNoteEditorProps {
  noteId: string;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  readOnly?: boolean;
}

export function BlockNoteEditor({ noteId, initialContent, onSave, readOnly = false }: BlockNoteEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Strip frontmatter from initial content
  const contentWithoutFrontmatter = stripFrontmatter(initialContent);

  // Initialize editor
  const editor = useCreateBlockNote({});

  // Load initial content
  useEffect(() => {
    if (!editor || !mounted || contentLoaded) return;

    const loadContent = async () => {
      try {
        if (contentWithoutFrontmatter && contentWithoutFrontmatter.trim()) {
          const blocks = await editor.tryParseMarkdownToBlocks(contentWithoutFrontmatter);
          editor.replaceBlocks(editor.document, blocks);
        }
        setContentLoaded(true);
      } catch (error) {
        console.error('Failed to load initial content:', error);
        setContentLoaded(true);
      }
    };

    loadContent();
  }, [editor, contentWithoutFrontmatter, mounted, contentLoaded]);

  // Handle content changes with debounced save
  useEffect(() => {
    if (!editor || !mounted || !contentLoaded) return;

    let timeoutId: NodeJS.Timeout;

    const handleUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const markdown = await editor.blocksToMarkdownLossy(editor.document);
          await onSave(markdown);
        } catch (error) {
          console.error('Failed to save:', error);
        }
      }, 2000); // 2 second debounce
    };

    // Listen for editor changes
    const unsubscribe = editor.onChange(handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [editor, onSave, mounted, contentLoaded]);

  // Reset content loaded flag when note changes
  useEffect(() => {
    setContentLoaded(false);
  }, [noteId]);

  // Set mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!editor || !mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto blocknote-editor-container">
      <BlockNoteView
        editor={editor}
        editable={!readOnly}
        theme="dark"
      />
    </div>
  );
}
