import type { ChatMessage, MessageRole } from './types'

function createMessageId(role: MessageRole): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createChatMessage(
  role: MessageRole,
  text: string,
): ChatMessage {
  return {
    id: createMessageId(role),
    role,
    text,
    createdAt: new Date().toISOString(),
  }
}
