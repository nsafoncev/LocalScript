import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { createChatListApi } from './mock-chat-list-api'

describe('createChatListApi', () => {
  it('returns a mocked list of chats', async () => {
    const api = createChatListApi(axios.create({ timeout: 0 }))
    const chats = await api.getChats()

    expect(chats.length).toBeGreaterThan(0)
    expect(chats[0]?.title).toBe('Стратегия запуска')
  })
})
