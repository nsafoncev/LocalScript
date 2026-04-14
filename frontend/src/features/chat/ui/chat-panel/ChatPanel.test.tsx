import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatPanel } from './ChatPanel'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ChatPanel', () => {
  it('renders initial empty state when there are no chats and no messages', () => {
    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        hasChats={false}
        isPending={false}
        messages={[]}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        theme="light"
        title="Новый чат"
      />,
    )

    expect(screen.getByText(/чем помочь/i)).toBeInTheDocument()
  })

  it('sends message on enter and clears the input after submit', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn(async () => undefined)

    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        hasChats={true}
        isPending={false}
        messages={[]}
        onSendMessage={onSendMessage}
        onStopGenerating={vi.fn()}
        theme="light"
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
        hasChats={true}
        isPending={false}
        messages={[]}
        onSendMessage={onSendMessage}
        onStopGenerating={vi.fn()}
        theme="light"
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
        hasChats={true}
        isPending={false}
        messages={[]}
        onSendMessage={onSendMessage}
        onStopGenerating={vi.fn()}
        theme="light"
        title="Второй чат"
      />,
    )

    expect(screen.getByLabelText(/поле ввода сообщения/i)).toHaveValue('')
  })

  it('renders compact draft state when chat already exists', () => {
    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        hasChats={true}
        isPending={false}
        messages={[]}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        theme="light"
        title="Новый чат"
      />,
    )

    expect(screen.getByText(/новый диалог/i)).toBeInTheDocument()
    expect(screen.getByText(/сформулируйте запрос/i)).toBeInTheDocument()
  })

  it('renders loading bubble after the latest message', () => {
    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        hasChats={true}
        isPending={true}
        messages={[
          {
            id: 'assistant-1',
            role: 'assistant',
            text: 'Первый ответ',
            format: 'text',
            createdAt: '2026-04-13T21:50:00.000Z',
          },
          {
            id: 'user-2',
            role: 'user',
            text: 'Второй запрос',
            format: 'text',
            createdAt: '2026-04-13T21:51:00.000Z',
          },
        ]}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        theme="light"
        title="Новый чат"
      />,
    )

    const latestMessage = screen.getByText('Второй запрос')
    const loading = screen.getByLabelText(/думаю/i)

    expect(
      latestMessage.compareDocumentPosition(loading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows scroll-to-bottom button only when the chat is not at the bottom', () => {
    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        hasChats={true}
        isPending={false}
        messages={[
          {
            id: 'assistant-1',
            role: 'assistant',
            text: 'Первый ответ',
            format: 'text',
            createdAt: '2026-04-13T21:50:00.000Z',
          },
        ]}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        theme="light"
        title="Новый чат"
      />,
    )

    const viewport = document.querySelector('[class*="messages"]')

    expect(viewport).not.toBeNull()

    if (!(viewport instanceof HTMLDivElement)) {
      throw new Error('Не удалось найти область прокрутки сообщений.')
    }

    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 700 },
      scrollTop: { configurable: true, value: 120, writable: true },
      clientHeight: { configurable: true, value: 320 },
    })

    fireEvent.scroll(viewport)

    expect(
      screen.getByRole('button', { name: /прокрутить чат вниз/i }),
    ).toBeInTheDocument()
  })

  it('scrolls to the latest message after clicking the button', async () => {
    const scrollIntoView = vi.fn()

    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoView)

    render(
      <ChatPanel
        chatId="chat-1"
        error={null}
        hasChats={true}
        isPending={false}
        messages={[
          {
            id: 'assistant-1',
            role: 'assistant',
            text: 'Первый ответ',
            format: 'text',
            createdAt: '2026-04-13T21:50:00.000Z',
          },
        ]}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        theme="light"
        title="Новый чат"
      />,
    )

    const viewport = document.querySelector('[class*="messages"]')

    expect(viewport).not.toBeNull()

    if (!(viewport instanceof HTMLDivElement)) {
      throw new Error('Не удалось найти область прокрутки сообщений.')
    }

    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 700 },
      scrollTop: { configurable: true, value: 120, writable: true },
      clientHeight: { configurable: true, value: 320 },
    })

    fireEvent.scroll(viewport)

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /прокрутить чат вниз/i }))

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'end',
    })
  })
})
