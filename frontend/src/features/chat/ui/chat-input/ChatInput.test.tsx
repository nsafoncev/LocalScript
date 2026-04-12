import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  it('keeps send button disabled when textarea is empty', () => {
    render(
      <ChatInput
        isPending={false}
        onSend={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: /отправить сообщение/i }),
    ).toBeDisabled()
  })

  it('sends message on Enter and clears textarea after submit', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn(async () => undefined)

    render(
      <ChatInput
        isPending={false}
        onSend={onSend}
        onStopGenerating={vi.fn()}
      />,
    )

    const textarea = screen.getByLabelText(/поле ввода сообщения/i)
    await user.type(textarea, 'Подготовь краткий ответ{enter}')

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith('Подготовь краткий ответ')
    })

    expect(screen.getByLabelText(/поле ввода сообщения/i)).toHaveValue('')
  })

  it('adds new line on Shift+Enter without sending', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn(async () => undefined)

    render(
      <ChatInput
        isPending={false}
        onSend={onSend}
        onStopGenerating={vi.fn()}
      />,
    )

    const textarea = screen.getByLabelText(/поле ввода сообщения/i)
    await user.type(textarea, 'Первая строка{shift>}{enter}{/shift}Вторая строка')

    expect(onSend).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('Первая строка\nВторая строка')
  })

  it('shows loading state while message is sending', async () => {
    const user = userEvent.setup()
    let resolveSend: () => void = () => undefined

    const onSend = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve
        }),
    )

    render(
      <ChatInput
        isPending={false}
        onSend={onSend}
        onStopGenerating={vi.fn()}
      />,
    )

    const textarea = screen.getByLabelText(/поле ввода сообщения/i)
    await user.type(textarea, 'Отправь запрос')
    await user.click(screen.getByRole('button', { name: /отправить сообщение/i }))

    expect(
      screen.getByRole('button', { name: /отправить сообщение/i }),
    ).toHaveAttribute('aria-busy', 'true')

    resolveSend()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /отправить сообщение/i }),
      ).toHaveAttribute('aria-busy', 'false')
    })
  })

  it('resizes textarea and resets its height after submit', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn(async () => undefined)

    render(
      <ChatInput
        isPending={false}
        onSend={onSend}
        onStopGenerating={vi.fn()}
      />,
    )

    const textarea = screen.getByLabelText(
      /поле ввода сообщения/i,
    ) as HTMLTextAreaElement

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      get: () => 140,
    })

    fireEvent.change(textarea, {
      target: {
        value: 'Первая строка\nВторая строка\nТретья строка',
      },
    })

    expect(textarea.style.height).toBe('140px')

    await user.type(textarea, '{enter}')

    await waitFor(() => {
      expect(textarea.style.height).toBe('56px')
    })
  })

  it('shows stop button during generation and calls stop handler', async () => {
    const user = userEvent.setup()
    const onStopGenerating = vi.fn()

    render(
      <ChatInput
        isPending
        onSend={vi.fn(async () => undefined)}
        onStopGenerating={onStopGenerating}
      />,
    )

    const stopButton = screen.getByRole('button', {
      name: /остановить генерацию/i,
    })

    expect(stopButton).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /отправить сообщение/i }),
    ).not.toBeInTheDocument()

    await user.click(stopButton)

    expect(onStopGenerating).toHaveBeenCalledTimes(1)
  })
})
