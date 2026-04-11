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
  const { activeChatTitle, chatError, isChatPending, messages, sendMessage } =
    useChatWorkspace()

  return (
    <section>
      <h1>{activeChatTitle}</h1>
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
      {chatError ? <p>{chatError}</p> : null}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.role}: {message.text}
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

  it('sends prompt to backend and stores assistant code', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        code: 'function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1)\n}',
      },
    })

    const user = userEvent.setup()

    render(<WorkspaceHarness />)

    await screen.findByRole('heading', { name: 'Стратегия запуска' })
    await user.click(screen.getByRole('button', { name: 'Отправить запрос' }))

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith('/generate', {
        prompt: 'Функция factorial(n) для n >= 0',
      })
    })

    expect(
      await screen.findByText(/assistant: function factorial\(n\)/i),
    ).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('shows russian error when backend request fails', async () => {
    postMock.mockRejectedValueOnce(new Error('offline'))

    const user = userEvent.setup()

    render(<WorkspaceHarness />)

    await screen.findByRole('heading', { name: 'Стратегия запуска' })
    await user.click(
      screen.getByRole('button', { name: 'Отправить ошибочный запрос' }),
    )

    expect(
      await screen.findByText(
        /не удалось получить код от сервера\. проверьте, что backend доступен, и попробуйте ещё раз\./i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })
})
