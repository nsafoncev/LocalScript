import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatPanel } from './ChatPanel'

describe('ChatPanel', () => {
  it('renders empty state when there are no messages', () => {
    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        isPending={false}
        messages={[]}
        onSendMessage={vi.fn(async () => undefined)}
        title="Новый чат"
      />,
    )

    expect(screen.getByText(/начните диалог/i)).toBeInTheDocument()
  })

  it('sends message on enter and clears the input after submit', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn(async () => undefined)

    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        isPending={false}
        messages={[]}
        onSendMessage={onSendMessage}
        title="Новый чат"
      />,
    )

    const input = screen.getByLabelText(/поле ввода сообщения/i)
    await user.type(input, 'Подготовь релиз{enter}')

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('Подготовь релиз')
    })

    expect(screen.getByLabelText(/поле ввода сообщения/i)).toHaveValue('')
  })

  it('clears draft when switching to another chat', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn(async () => undefined)

    const { rerender } = render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        isPending={false}
        messages={[]}
        onSendMessage={onSendMessage}
        title="Первый чат"
      />,
    )

    const input = screen.getByLabelText(/поле ввода сообщения/i)
    await user.type(input, 'Черновик для первого чата')

    expect(input).toHaveValue('Черновик для первого чата')

    rerender(
      <ChatPanel
        chatId="chat-2"
        error={null}
        isPending={false}
        messages={[]}
        onSendMessage={onSendMessage}
        title="Второй чат"
      />,
    )

    expect(screen.getByLabelText(/поле ввода сообщения/i)).toHaveValue('')
  })
})
