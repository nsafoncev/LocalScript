import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createLocalChatPreview } from '../../../../entities/chat'
import { SidebarPanel } from './SidebarPanel'

describe('SidebarPanel', () => {
  it('calls create chat handler', async () => {
    const user = userEvent.setup()
    const onCreateChat = vi.fn()

    render(
      <SidebarPanel
        activeChatId={null}
        chats={[]}
        error={null}
        isLoading={false}
        onCreateChat={onCreateChat}
        onSelectChat={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /новый чат/i }))

    expect(onCreateChat).toHaveBeenCalledTimes(1)
  })

  it('renders active chat marker for selected item', () => {
    const chat = createLocalChatPreview()

    render(
      <SidebarPanel
        activeChatId={chat.id}
        chats={[chat]}
        error={null}
        isLoading={false}
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
      />,
    )

    expect(screen.getByTitle(chat.title)).toHaveAttribute('aria-pressed', 'true')
  })
})
