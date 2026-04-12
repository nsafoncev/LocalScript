import type { MessageFormat } from '../../../shared/lib/message-format'

export type MessageRole = 'assistant' | 'user'

export interface ChatMessage {
  readonly id: string
  readonly role: MessageRole
  readonly text: string
  readonly format: MessageFormat
  readonly createdAt: string
}
