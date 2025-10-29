import { BlockNoteSchema, defaultInlineContentSpecs, defaultStyleSpecs } from '@blocknote/core'
import { createReactInlineContentSpec } from '@blocknote/react'

// Page Link Inline Content (triggered by #)
export const PageLink = createReactInlineContentSpec(
  {
    type: 'pageLink',
    propSchema: {
      pageId: {
        default: '',
      },
      title: {
        default: '',
      },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
        onClick={() => {
          // Handle page navigation
          console.log('Navigate to page:', props.inlineContent.props.pageId)
        }}
      >
        <span className="text-sm">#</span>
        <span className="font-medium">{props.inlineContent.props.title}</span>
      </span>
    ),
  }
)

// Member Mention Inline Content (triggered by @)
export const MemberMention = createReactInlineContentSpec(
  {
    type: 'memberMention',
    propSchema: {
      userId: {
        default: '',
      },
      username: {
        default: '',
      },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer transition-colors"
        onClick={() => {
          // Handle user profile view
          console.log('View user:', props.inlineContent.props.userId)
        }}
      >
        <span className="text-sm">@</span>
        <span className="font-medium">{props.inlineContent.props.username}</span>
      </span>
    ),
  }
)

// Custom schema with inline content
export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    pageLink: PageLink,
    memberMention: MemberMention,
  },
  styleSpecs: {
    ...defaultStyleSpecs,
  },
})

export type EditorSchema = typeof schema
