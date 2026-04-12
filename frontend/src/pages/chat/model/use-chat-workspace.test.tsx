import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { JSX } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatWorkspace } from './use-chat-workspace'

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}))

vi.mock('../../../shared/api', () => ({
  httpClient: {
    defaults: {
      timeout: 0,
    },
    post: postMock,
  },
}))

function WorkspaceHarness(): JSX.Element {
  const {
    activeChatTitle,
    chatError,
    chats,
    createChat,
    isChatPending,
    messages,
    sendMessage,
    stopGenerating,
  } = useChatWorkspace()

  return (
    <section>
      <h1>{activeChatTitle}</h1>
      <p>Чатов: {chats.length}</p>
      <button type="button" onClick={createChat}>
        Создать чат
      </button>
      <button
        type="button"
        onClick={() => {
          void sendMessage('Функция factorial(n) для n >= 0')
        }}
      >
        Отправить запрос
      </button>
      <button
        type="button"
        onClick={() => {
          void sendMessage('Сгенерируй пример')
        }}
      >
        Отправить ошибочный запрос
      </button>
      <span>{isChatPending ? 'loading' : 'idle'}</span>
      <button type="button" onClick={stopGenerating}>
        Остановить
      </button>
      {chatError ? <p>{chatError}</p> : null}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.role}/{message.format}: {message.text}
          </li>
        ))}
      </ul>
    </section>
  )
}

describe('useChatWorkspace backend integration', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('starts with an empty chat history', async () => {
    render(<WorkspaceHarness />)

    expect(await screen.findByText('Чатов: 0')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Новый чат' })).toBeInTheDocument()
  })

  it('creates the first chat only after explicit action', async () => {
    const user = userEvent.setup()

    render(<WorkspaceHarness />)

    await screen.findByText('Чатов: 0')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))

    expect(await screen.findByText('Чатов: 1')).toBeInTheDocument()
  })

  it('sends prompt to backend and creates chat on first message', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        code: 'function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1)\n}',
      },
    })

    const user = userEvent.setup()

    render(<WorkspaceHarness />)

    await screen.findByText('Чатов: 0')
    await user.click(screen.getByRole('button', { name: 'Отправить запрос' }))

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        '/generate',
        {
          prompt: 'Функция factorial(n) для n >= 0',
        },
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })

    expect(await screen.findByText('Чатов: 1')).toBeInTheDocument()
    expect(
      await screen.findByText(/assistant\/code: function factorial\(n\)/i),
    ).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('shows russian error when backend request fails', async () => {
    postMock.mockRejectedValueOnce(new Error('offline'))

    const user = userEvent.setup()

    render(<WorkspaceHarness />)

    await screen.findByText('Чатов: 0')
    await user.click(screen.getByRole('button', { name: 'Отправить ошибочный запрос' }))

    expect(
      await screen.findByText(
        /не удалось получить код от сервера\. проверьте, что backend доступен, и попробуйте ещё раз\./i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('stops generation and does not add unfinished assistant message', async () => {
    let abortSignal: AbortSignal | undefined

    postMock.mockImplementation(
      async (
        _url: string,
        _payload: unknown,
        config?: { signal?: AbortSignal },
      ) => {
        abortSignal = config?.signal

        return new Promise<never>((_, reject) => {
          config?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        })
      },
    )

    const user = userEvent.setup()

    render(<WorkspaceHarness />)

    await screen.findByText('Чатов: 0')
    await user.click(screen.getByRole('button', { name: 'Отправить запрос' }))

    expect(await screen.findByText('loading')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Остановить' }))

    await waitFor(() => {
      expect(abortSignal?.aborted).toBe(true)
      expect(screen.getByText('idle')).toBeInTheDocument()
    })

    expect(
      screen.queryByText(/assistant\/code: function factorial/i),
    ).not.toBeInTheDocument()
  })
})
