import { describe, expect, it } from 'vitest'
import { createLocalChatPreview } from '../../../entities/chat'
import { initialSidebarState, sidebarReducer } from './sidebar-reducer'

describe('sidebarReducer', () => {
  it('marks the first loaded chat as active', () => {
    const chat = createLocalChatPreview()

    const state = sidebarReducer(initialSidebarState, {
      type: 'loadSucceeded',
      payload: [chat],
    })

    expect(state.activeChatId).toBe(chat.id)
  })

  it('prepends a new chat and selects it', () => {
    const chat = createLocalChatPreview()

    const state = sidebarReducer(initialSidebarState, {
      type: 'chatCreated',
      payload: chat,
    })

    expect(state.chats[0]?.id).toBe(chat.id)
    expect(state.activeChatId).toBe(chat.id)
  })

  it('closes and opens sidebar explicitly', () => {
    const closedState = sidebarReducer(initialSidebarState, {
      type: 'sidebarClosed',
    })

    const reopenedState = sidebarReducer(closedState, {
      type: 'sidebarOpened',
    })

    expect(closedState.isOpen).toBe(false)
    expect(reopenedState.isOpen).toBe(true)
  })
})
