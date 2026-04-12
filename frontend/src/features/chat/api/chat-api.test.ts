import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createChatApi } from './chat-api'

describe('createChatApi', () => {
  it('sends prompt to backend and returns generated code', async () => {
    const client = axios.create()
    const postSpy = vi
      .spyOn(client, 'post')
      .mockResolvedValue({ data: { code: 'print("Hello")' } })
    const chatApi = createChatApi(client)

    const result = await chatApi.sendMessage({
      prompt: 'Сгенерируй приветствие',
    })

    expect(postSpy).toHaveBeenCalledWith(
      '/generate',
      {
        prompt: 'Сгенерируй приветствие',
      },
      {
        signal: undefined,
      },
    )
    expect(result).toEqual({ code: 'print("Hello")' })
  })

  it('throws russian error when backend request fails', async () => {
    const client = axios.create()
    vi.spyOn(client, 'post').mockRejectedValue(new Error('Network Error'))
    const chatApi = createChatApi(client)

    await expect(
      chatApi.sendMessage({
        prompt: 'Сгенерируй функцию',
      }),
    ).rejects.toThrow(
      'Не удалось получить код от сервера. Проверьте, что backend доступен, и попробуйте ещё раз.',
    )
  })
})
