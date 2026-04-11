import { describe, expect, it } from 'vitest'
import { createChatMessage } from '../../../entities/message'
import { chatReducer, initialChatSessionState } from './chat-reducer'

describe('chatReducer', () => {
  it('adds queued user messages and clears previous error', () => {
    const stateWithError = {
      ...initialChatSessionState,
      error: 'old error',
    }

    const nextState = chatReducer(stateWithError, {
      type: 'messageQueued',
      payload: createChatMessage('user', 'Hello'),
    })

    expect(nextState.messages).toHaveLength(1)
    expect(nextState.error).toBeNull()
  })

  it('stores assistant response and turns loading off', () => {
    const loadingState = {
      ...initialChatSessionState,
      isPending: true,
      messages: [createChatMessage('user', 'Hello')],
    }

    const nextState = chatReducer(loadingState, {
      type: 'responseReceived',
      payload: createChatMessage('assistant', 'Hi there'),
    })

    expect(nextState.isPending).toBe(false)
    expect(nextState.messages).toHaveLength(2)
    expect(nextState.messages[1]?.role).toBe('assistant')
  })
})
