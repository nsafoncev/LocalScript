import type { ChatMessage } from '../../../entities/message'

export interface SendMessagePayload {
  readonly chatId: string
  readonly message: string
  readonly history: readonly ChatMessage[]
}

export interface SendMessageResult {
  readonly message: ChatMessage
}

export interface ChatApi {
  sendMessage(payload: SendMessagePayload): Promise<SendMessageResult>
}
