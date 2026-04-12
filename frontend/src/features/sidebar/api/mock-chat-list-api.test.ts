import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { createChatListApi } from './mock-chat-list-api'

describe('createChatListApi', () => {
  it('returns an empty list before the user creates chats', async () => {
    const api = createChatListApi(axios.create({ timeout: 0 }))
    const chats = await api.getChats()

    expect(chats).toEqual([])
  })
})
