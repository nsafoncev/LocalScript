import { describe, expect, it } from 'vitest'
import { createChatMessage } from '../../../entities/message'
import {
  chatSessionsReducer,
  initialChatSessionsState,
} from './chat-sessions-reducer'

describe('chatSessionsReducer', () => {
  it('registers a chat session once', () => {
    const state = chatSessionsReducer(initialChatSessionsState, {
      type: 'sessionRegistered',
      payload: {
        chatId: 'chat-1',
        messages: [createChatMessage('assistant', 'Привет')],
      },
    })

    expect(state.sessions['chat-1']?.messages).toHaveLength(1)
  })

  it('updates only the targeted chat session', () => {
    const registered = chatSessionsReducer(initialChatSessionsState, {
      type: 'sessionRegistered',
      payload: { chatId: 'chat-1', messages: [] },
    })

    const nextState = chatSessionsReducer(registered, {
      type: 'sessionUpdated',
      payload: {
        chatId: 'chat-1',
        action: {
          type: 'messageQueued',
          payload: createChatMessage('user', 'Нужно обновление'),
        },
      },
    })

    expect(nextState.sessions['chat-1']?.messages).toHaveLength(1)
  })
})
