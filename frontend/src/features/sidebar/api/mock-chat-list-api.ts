import type { AxiosInstance } from 'axios'
import type { ChatPreview } from '../../../entities/chat'
import { delay } from '../../../shared/lib/delay'

const MOCK_DELAY_MS = 120

export interface ChatListApi {
  getChats(): Promise<readonly ChatPreview[]>
}

export function createChatListApi(client: AxiosInstance): ChatListApi {
  return {
    async getChats(): Promise<readonly ChatPreview[]> {
      const timeout = client.defaults.timeout ?? MOCK_DELAY_MS

      await delay(Math.min(timeout, MOCK_DELAY_MS))

      return []

      /*
      Future backend implementation:
      const { data } = await client.get<readonly ChatPreview[]>('/chats')
      return data
      */
    },
  }
}
