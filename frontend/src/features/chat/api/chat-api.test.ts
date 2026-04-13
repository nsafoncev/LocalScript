import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createChatApi } from './chat-api'

describe('createChatApi', () => {
  it('sends session-aware request to chat endpoint and returns generated code', async () => {
    const client = axios.create()
    const postSpy = vi
      .spyOn(client, 'post')
      .mockResolvedValue({ data: { status: 'completed', code: 'print("Hello")' } })
    const chatApi = createChatApi(client)

    const result = await chatApi.sendMessage({
      sessionId: 'chat-1',
      message: 'Сгенерируй приветствие',
      context: '',
    })

    expect(postSpy).toHaveBeenCalledWith(
      '/chat',
      {
        session_id: 'chat-1',
        message: 'Сгенерируй приветствие',
        context: '',
      },
      {
        signal: undefined,
      },
    )
    expect(result).toEqual({ status: 'completed', code: 'print("Hello")' })
  })

  it('throws russian error when backend request fails', async () => {
    const client = axios.create()
    vi.spyOn(client, 'post').mockRejectedValue(new Error('Network Error'))
    const chatApi = createChatApi(client)

    await expect(
      chatApi.sendMessage({
        sessionId: 'chat-1',
        message: 'Сгенерируй функцию',
      }),
    ).rejects.toThrow(
      'Не удалось получить код от сервера. Проверьте, что backend доступен, и попробуйте ещё раз.',
    )
  })

  it('throws timeout-specific error when request is too slow', async () => {
    const client = axios.create()
    vi.spyOn(client, 'post').mockRejectedValue({ code: 'ECONNABORTED' })
    const chatApi = createChatApi(client)

    await expect(
      chatApi.sendMessage({
        sessionId: 'chat-1',
        message: 'Сгенерируй функцию',
      }),
    ).rejects.toThrow(
      'Генерация заняла слишком много времени. Попробуйте ещё раз или упростите запрос.',
    )
  })

  it('surfaces backend detail when it is available', async () => {
    const client = axios.create()
    vi.spyOn(client, 'post').mockRejectedValue({
      response: {
        data: {
          detail: 'Ollama is unavailable. Start the service.',
        },
      },
    })
    const chatApi = createChatApi(client)

    await expect(
      chatApi.sendMessage({
        sessionId: 'chat-1',
        message: 'Сгенерируй функцию',
      }),
    ).rejects.toThrow('Ollama is unavailable. Start the service.')
  })

  it('passes clarification response through unchanged', async () => {
    const client = axios.create()
    vi.spyOn(client, 'post').mockResolvedValue({
      data: {
        status: 'needs_clarification',
        message: 'Какую переменную или поле из wf нужно использовать?',
      },
    })
    const chatApi = createChatApi(client)

    const result = await chatApi.sendMessage({
      sessionId: 'chat-1',
      message: 'Добавь квадрат числа',
    })

    expect(result).toEqual({
      status: 'needs_clarification',
      message: 'Какую переменную или поле из wf нужно использовать?',
    })
  })
})
