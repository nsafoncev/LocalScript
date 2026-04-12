import type { ChatSessionState, ChatSessionAction } from './types'

export const initialChatSessionState: ChatSessionState = {
  messages: [],
  isPending: false,
  error: null,
}

export function chatReducer(
  state: ChatSessionState,
  action: ChatSessionAction,
): ChatSessionState {
  switch (action.type) {
    case 'messageQueued':
      return {
        ...state,
        error: null,
        messages: [...state.messages, action.payload],
      }
    case 'requestStarted':
      return {
        ...state,
        isPending: true,
        error: null,
      }
    case 'requestCancelled':
      return {
        ...state,
        isPending: false,
        error: null,
      }
    case 'responseReceived':
      return {
        ...state,
        isPending: false,
        error: null,
        messages: [...state.messages, action.payload],
      }
    case 'requestFailed':
      return {
        ...state,
        isPending: false,
        error: action.payload,
      }
    default:
      return state
  }
}
