import type { AxiosInstance } from 'axios'
import type { ChatPreview } from '../../../entities/chat'
import { delay } from '../../../shared/lib/delay'

const MOCK_DELAY_MS = 420

const MOCK_CHATS: readonly ChatPreview[] = [
  {
    id: 'chat-strategy',
    title: 'Стратегия запуска',
    lastMessage: 'Подготовил поэтапный план запуска продукта на две недели.',
    updatedAt: '2026-04-11T08:30:00.000Z',
  },
  {
    id: 'chat-content',
    title: 'Контент-план',
    lastMessage: 'Собрал темы для публикаций и распределил их по форматам.',
    updatedAt: '2026-04-11T07:50:00.000Z',
  },
  {
    id: 'chat-research',
    title: 'Исследование рынка',
    lastMessage: 'Сравнил конкурентов и выделил ключевые отличия в позиционировании.',
    updatedAt: '2026-04-10T18:15:00.000Z',
  },
]

export interface ChatListApi {
  getChats(): Promise<readonly ChatPreview[]>
}

export function createChatListApi(client: AxiosInstance): ChatListApi {
  return {
    async getChats(): Promise<readonly ChatPreview[]> {
      const timeout = client.defaults.timeout ?? MOCK_DELAY_MS

      await delay(Math.min(timeout, MOCK_DELAY_MS))

      return MOCK_CHATS

      /*
      Future backend implementation:
      const { data } = await client.get<readonly ChatPreview[]>('/chats')
      return data
      */
    },
  }
}
