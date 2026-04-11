import type { ChatPreview } from './types'

const DEFAULT_CHAT_TITLE = 'Новый чат'
const EMPTY_CHAT_MESSAGE = 'Сообщений пока нет'

function createChatId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createLocalChatPreview(): ChatPreview {
  return {
    id: createChatId(),
    title: DEFAULT_CHAT_TITLE,
    lastMessage: EMPTY_CHAT_MESSAGE,
    updatedAt: new Date().toISOString(),
  }
}

export function deriveChatTitle(message: string): string {
  const trimmedMessage = message.trim()

  if (!trimmedMessage) {
    return DEFAULT_CHAT_TITLE
  }

  const normalized = trimmedMessage.replace(/\s+/g, ' ')

  return normalized.length > 30
    ? `${normalized.slice(0, 30)}...`
    : normalized
}

export function updateChatPreview(
  chat: ChatPreview,
  params: Readonly<{
    lastMessage: string
    title?: string
  }>,
): ChatPreview {
  return {
    ...chat,
    title: params.title ?? chat.title,
    lastMessage: params.lastMessage,
    updatedAt: new Date().toISOString(),
  }
}

export function isDraftChat(chat: ChatPreview): boolean {
  return chat.title === DEFAULT_CHAT_TITLE
}
