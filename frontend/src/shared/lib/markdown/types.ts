export type MarkdownInlineNode =
  | {
      readonly type: 'text'
      readonly value: string
    }
  | {
      readonly type: 'code'
      readonly value: string
    }

export type MarkdownBlock =
  | {
      readonly type: 'paragraph'
      readonly nodes: readonly MarkdownInlineNode[]
    }
  | {
      readonly type: 'code'
      readonly code: string
      readonly language: string | null
    }
