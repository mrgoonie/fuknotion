import { Block, BlockNoteEditor } from '@blocknote/core';

/**
 * Converts markdown to BlockNote blocks
 * BlockNote has built-in markdown parsing, so we use that
 */
export async function markdownToBlocks(
  editor: BlockNoteEditor,
  markdown: string
): Promise<Block[]> {
  try {
    const blocks = await editor.tryParseMarkdownToBlocks(markdown);
    return blocks;
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    // Return a default paragraph block with the raw markdown
    return [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: markdown, styles: {} }],
      } as any,
    ];
  }
}

/**
 * Converts BlockNote blocks to markdown
 * Uses BlockNote's built-in conversion
 */
export async function blocksToMarkdown(
  editor: BlockNoteEditor,
  blocks: Block[]
): Promise<string> {
  try {
    const markdown = await editor.blocksToMarkdownLossy(blocks);
    return markdown;
  } catch (error) {
    console.error('Failed to convert blocks to markdown:', error);
    return '';
  }
}

/**
 * Strips YAML frontmatter from markdown content
 * Returns only the body content
 */
export function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\n')) {
    return markdown;
  }

  const parts = markdown.slice(4).split('\n---\n', 2);
  if (parts.length !== 2) {
    return markdown;
  }

  // Return content after frontmatter, trimming leading newline
  return parts[1].replace(/^\n/, '');
}

/**
 * Extracts YAML frontmatter from markdown
 * Returns frontmatter as string (without delimiters)
 */
export function extractFrontmatter(markdown: string): string | null {
  if (!markdown.startsWith('---\n')) {
    return null;
  }

  const parts = markdown.slice(4).split('\n---\n', 2);
  if (parts.length !== 2) {
    return null;
  }

  return parts[0];
}

/**
 * Combines frontmatter and content into full markdown
 */
export function addFrontmatter(frontmatter: string, content: string): string {
  return `---\n${frontmatter}\n---\n${content}`;
}
