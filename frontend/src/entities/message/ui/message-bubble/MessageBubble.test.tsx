import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createChatMessage } from '../../model/create-message'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('shows copy button for assistant code message', async () => {
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
        message={createChatMessage('assistant', 'const answer = 42\nreturn answer')}
      />,
    )

    await user.click(screen.getByRole('button', { name: /скопировать/i }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('const answer = 42\nreturn answer')
    })

    expect(screen.getByRole('button', { name: /скопировано/i })).toBeInTheDocument()
  })

  it('does not show copy button for user message', () => {
    render(
      <MessageBubble
        message={createChatMessage('user', 'Подготовь краткий ответ')}
      />,
    )

    expect(screen.queryByRole('button', { name: /скопировать/i })).not.toBeInTheDocument()
  })
})
