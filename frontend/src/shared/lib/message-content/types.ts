export type UserMessageContentBlock =
  | {
      readonly type: 'paragraph'
      readonly text: string
    }
  | {
      readonly type: 'code'
      readonly code: string
      readonly language: string | null
    }
