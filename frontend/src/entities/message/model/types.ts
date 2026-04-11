export type MessageRole = 'assistant' | 'user'

export interface ChatMessage {
  readonly id: string
  readonly role: MessageRole
  readonly text: string
  readonly createdAt: string
}
