import type { AxiosInstance } from 'axios'
import { createChatMessage } from '../../../entities/message'
import { delay } from '../../../shared/lib/delay'
import type { ChatApi, SendMessagePayload, SendMessageResult } from './types'

const MOCK_DELAY_MS = 900

function buildAssistantReply(
  chatId: string,
  message: string,
  historyLength: number,
): string {
  const cleanedMessage = message.trim()
  const preview =
    cleanedMessage.length > 88
      ? `${cleanedMessage.slice(0, 88)}...`
      : cleanedMessage

  return [
    `Получил сообщение: «${preview}».`,
    `Сейчас это mock-ответ после имитации сетевого запроса для чата ${chatId}.`,
    `В текущем диалоге уже ${historyLength} сообщени${
      historyLength === 1 ? 'е' : historyLength < 5 ? 'я' : 'й'
    }, поэтому интерфейс готов к контекстным ответам после подключения backend.`,
  ].join(' ')
}

export function createChatApi(client: AxiosInstance): ChatApi {
  return {
    async sendMessage(
      payload: SendMessagePayload,
    ): Promise<SendMessageResult> {
      const timeout = client.defaults.timeout ?? MOCK_DELAY_MS

      await delay(Math.min(timeout, MOCK_DELAY_MS))

      return {
        message: createChatMessage(
          'assistant',
          buildAssistantReply(
            payload.chatId,
            payload.message,
            payload.history.length,
          ),
        ),
      }

      /*
      Future backend implementation:
      const { data } = await client.post<SendMessageResult>('/chat/messages', payload)
      return data
      */
    },
  }
}
