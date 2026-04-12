import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createLocalChatPreview } from '../../../entities/chat'
import { ChatLayout } from './ChatLayout'

const baseChat = createLocalChatPreview()

describe('ChatLayout', () => {
  it('shows burger button when sidebar is closed', () => {
    render(
        <ChatLayout
          activeChatId={baseChat.id}
          activeChatTitle={baseChat.title}
        chatError={null}
          chats={[baseChat]}
        isChatPending={false}
        isSidebarLoading={false}
        isSidebarOpen={false}
        messages={[]}
        onCloseSidebar={vi.fn()}
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        onToggleSidebar={vi.fn()}
        onToggleTheme={vi.fn()}
        sidebarError={null}
        theme="light"
      />,
    )

    expect(
      screen.getByRole('button', { name: /открыть меню чатов/i }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('closes mobile overlay on background click', async () => {
    const user = userEvent.setup()
    const onCloseSidebar = vi.fn()

    render(
        <ChatLayout
          activeChatId={baseChat.id}
        activeChatTitle={baseChat.title}
        chatError={null}
          chats={[baseChat]}
        isChatPending={false}
        isSidebarLoading={false}
        isSidebarOpen={true}
        messages={[]}
        onCloseSidebar={onCloseSidebar}
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        onToggleSidebar={vi.fn()}
        onToggleTheme={vi.fn()}
        sidebarError={null}
        theme="light"
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /закрыть overlay чатов/i }),
    )

    expect(onCloseSidebar).toHaveBeenCalledTimes(1)
  })

  it('renders active burger state when sidebar is open', () => {
    render(
        <ChatLayout
          activeChatId={baseChat.id}
        activeChatTitle={baseChat.title}
        chatError={null}
          chats={[baseChat]}
        isChatPending={false}
        isSidebarLoading={false}
        isSidebarOpen={true}
        messages={[]}
        onCloseSidebar={vi.fn()}
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        onToggleSidebar={vi.fn()}
        onToggleTheme={vi.fn()}
        sidebarError={null}
        theme="dark"
      />,
    )

    expect(
      screen.getByRole('button', { name: /закрыть меню чатов/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls theme toggle handler from header switch', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()

    render(
        <ChatLayout
          activeChatId={baseChat.id}
        activeChatTitle={baseChat.title}
        chatError={null}
          chats={[baseChat]}
        isChatPending={false}
        isSidebarLoading={false}
        isSidebarOpen={false}
        messages={[]}
        onCloseSidebar={vi.fn()}
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        onToggleSidebar={vi.fn()}
        onToggleTheme={onToggleTheme}
        sidebarError={null}
        theme="light"
      />,
    )

    await user.click(screen.getByRole('switch', { name: /переключить тему/i }))

    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('keeps header minimal without marketing text', () => {
    render(
        <ChatLayout
          activeChatId={baseChat.id}
        activeChatTitle={baseChat.title}
        chatError={null}
          chats={[baseChat]}
        isChatPending={false}
        isSidebarLoading={false}
        isSidebarOpen={false}
        messages={[]}
        onCloseSidebar={vi.fn()}
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onSendMessage={vi.fn(async () => undefined)}
        onStopGenerating={vi.fn()}
        onToggleSidebar={vi.fn()}
        onToggleTheme={vi.fn()}
        sidebarError={null}
        theme="light"
      />,
    )

    expect(screen.queryByText(/корпоративный ai-чат/i)).not.toBeInTheDocument()
  })
})
