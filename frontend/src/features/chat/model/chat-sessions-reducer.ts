import type { ChatMessage } from '../../../entities/message'
import { chatReducer, initialChatSessionState } from './chat-reducer'
import type { ChatSessionAction, ChatSessionsState } from './types'

export type ChatSessionsAction =
  | {
      type: 'sessionRegistered'
      payload: {
        chatId: string
        messages: readonly ChatMessage[]
      }
    }
  | {
      type: 'sessionUpdated'
      payload: {
        chatId: string
        action: ChatSessionAction
      }
    }

export const initialChatSessionsState: ChatSessionsState = {
  sessions: {},
}

export function chatSessionsReducer(
  state: ChatSessionsState,
  action: ChatSessionsAction,
): ChatSessionsState {
  switch (action.type) {
    case 'sessionRegistered': {
      if (state.sessions[action.payload.chatId]) {
        return state
      }

      return {
        sessions: {
          ...state.sessions,
          [action.payload.chatId]: {
            ...initialChatSessionState,
            messages: action.payload.messages,
          },
        },
      }
    }
    case 'sessionUpdated': {
      const currentSession =
        state.sessions[action.payload.chatId] ?? initialChatSessionState

      return {
        sessions: {
          ...state.sessions,
          [action.payload.chatId]: chatReducer(
            currentSession,
            action.payload.action,
          ),
        },
      }
    }
    default:
      return state
  }
}
