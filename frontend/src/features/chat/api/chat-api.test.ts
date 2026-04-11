import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { createChatMessage } from '../../../entities/message'
import { createChatApi } from './chat-api'

describe('createChatApi', () => {
  it('returns a mocked assistant message after a simulated request', async () => {
    const client = axios.create({ baseURL: '/api', timeout: 0 })
    const chatApi = createChatApi(client)

    const result = await chatApi.sendMessage({
      chatId: 'chat-1',
      message: 'Plan the next sprint',
      history: [createChatMessage('user', 'Hello')],
    })

    expect(result.message.role).toBe('assistant')
    expect(result.message.text).toContain('mock-ответ')
  })
})
