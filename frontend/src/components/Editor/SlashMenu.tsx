export interface SlashMenuItem {
  title: string
  onItemClick: () => void
  icon?: React.ReactNode
  subtext?: string
  aliases?: string[]
  group?: string
}

export const getSlashMenuItems = (editor: any): SlashMenuItem[] => [
  // Basic Blocks
  {
    title: 'Heading 1',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'heading',
            props: { level: 1 },
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['h1', 'heading1', 'title'],
    group: 'Basic Blocks',
    icon: <span className="text-2xl font-bold">H1</span>,
    subtext: 'Large heading',
  },
  {
    title: 'Heading 2',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'heading',
            props: { level: 2 },
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['h2', 'heading2', 'subtitle'],
    group: 'Basic Blocks',
    icon: <span className="text-xl font-bold">H2</span>,
    subtext: 'Medium heading',
  },
  {
    title: 'Heading 3',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'heading',
            props: { level: 3 },
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['h3', 'heading3'],
    group: 'Basic Blocks',
    icon: <span className="text-lg font-bold">H3</span>,
    subtext: 'Small heading',
  },
  {
    title: 'Bullet List',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'bulletListItem',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['ul', 'list', 'bullet'],
    group: 'Basic Blocks',
    icon: <span>•</span>,
    subtext: 'Unordered list',
  },
  {
    title: 'Numbered List',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'numberedListItem',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['ol', 'numbered', '1.'],
    group: 'Basic Blocks',
    icon: <span>1.</span>,
    subtext: 'Ordered list',
  },
  {
    title: 'Check List',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'checkListItem',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['todo', 'task', 'checkbox', '[]'],
    group: 'Basic Blocks',
    icon: <span>☐</span>,
    subtext: 'To-do list with checkboxes',
  },
  {
    title: 'Quote',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'quote',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['blockquote', 'citation'],
    group: 'Basic Blocks',
    icon: <span>"</span>,
    subtext: 'Capture a quote',
  },
  {
    title: 'Code Block',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'codeBlock',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['code', 'snippet', '```'],
    group: 'Advanced',
    icon: <span>{`</>`}</span>,
    subtext: 'Code with syntax highlighting',
  },
  {
    title: 'Table',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'table',
            content: {
              type: 'tableContent',
              rows: [
                {
                  cells: ['', '', ''],
                },
                {
                  cells: ['', '', ''],
                },
              ],
            },
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['table', 'grid'],
    group: 'Advanced',
    icon: <span>⊞</span>,
    subtext: 'Insert a table',
  },
  {
    title: 'Divider',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'paragraph',
          },
          {
            type: 'divider',
          },
          {
            type: 'paragraph',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['hr', 'horizontal', '---', 'separator'],
    group: 'Advanced',
    icon: <span>─</span>,
    subtext: 'Visual separator',
  },
  {
    title: 'Image',
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'image',
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    },
    aliases: ['img', 'picture', 'photo'],
    group: 'Media',
    icon: <span>🖼</span>,
    subtext: 'Upload or embed image',
  },
]
