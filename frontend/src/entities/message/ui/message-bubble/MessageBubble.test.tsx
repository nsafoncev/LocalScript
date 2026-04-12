import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createChatMessage } from '../../model/create-message'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('copies full assistant message and code separately', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn(async () => undefined)

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })

    render(
      <MessageBubble
        message={createChatMessage(
          'assistant',
          'const answer = 42\nreturn answer',
          'code',
        )}
        theme="light"
      />,
    )

    await user.click(screen.getByRole('button', { name: /скопировать код/i }))
    await user.click(
      screen.getByRole('button', { name: /скопировать сообщение/i }),
    )

    await waitFor(() => {
      expect(writeText).toHaveBeenNthCalledWith(
        1,
        'const answer = 42\nreturn answer',
      )
      expect(writeText).toHaveBeenNthCalledWith(
        2,
        'const answer = 42\nreturn answer',
      )
    })

    expect(screen.getByText(/код скопирован/i)).toBeInTheDocument()
    expect(screen.getByText(/сообщение скопировано/i)).toBeInTheDocument()
  })

  it('shows only full message copy for user message', () => {
    render(
      <MessageBubble
        message={createChatMessage('user', 'Подготовь краткий ответ')}
        theme="dark"
      />,
    )

    expect(
      screen.getByRole('button', { name: /скопировать сообщение/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /скопировать код/i }),
    ).not.toBeInTheDocument()
  })
})
