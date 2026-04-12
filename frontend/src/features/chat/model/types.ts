import type { ChatMessage } from '../../../entities/message'

export interface ChatSessionState {
  readonly messages: readonly ChatMessage[]
  readonly isPending: boolean
  readonly error: string | null
}

export interface ChatSessionsState {
  readonly sessions: Readonly<Record<string, ChatSessionState>>
}

export type ChatSessionAction =
  | { type: 'messageQueued'; payload: ChatMessage }
  | { type: 'requestStarted' }
  | { type: 'requestCancelled' }
  | { type: 'responseReceived'; payload: ChatMessage }
  | { type: 'requestFailed'; payload: string }
