import type { JSX } from 'react'
import type { ChatPreview } from '../../../entities/chat'
import type { ChatMessage } from '../../../entities/message'
import { ChatPanel } from '../../../features/chat'
import { SidebarPanel } from '../../../features/sidebar'
import type { AppTheme } from '../../../shared/lib/theme/types'
import { BurgerButton, ThemeToggle } from '../../../shared/ui'
import styles from './ChatLayout.module.scss'

type ChatLayoutProps = {
  chats: readonly ChatPreview[]
  activeChatId: string | null
  activeChatTitle: string
  messages: readonly ChatMessage[]
  isSidebarOpen: boolean
  isSidebarLoading: boolean
  sidebarError: string | null
  chatError: string | null
  isChatPending: boolean
  theme: AppTheme
  onCreateChat: () => void
  onSelectChat: (chatId: string) => void
  onToggleSidebar: () => void
  onCloseSidebar: () => void
  onToggleTheme: () => void
  onSendMessage: (value: string) => Promise<void>
}

export function ChatLayout({
  chats,
  activeChatId,
  activeChatTitle,
  messages,
  isSidebarOpen,
  isSidebarLoading,
  sidebarError,
  chatError,
  isChatPending,
  theme,
  onCreateChat,
  onSelectChat,
  onToggleSidebar,
  onCloseSidebar,
  onToggleTheme,
  onSendMessage,
}: ChatLayoutProps): JSX.Element {
  return (
    <section className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarMain}>
          <BurgerButton
            className={styles.burger}
            isActive={isSidebarOpen}
            label={isSidebarOpen ? 'Закрыть меню чатов' : 'Открыть меню чатов'}
            onClick={onToggleSidebar}
          />
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <div className={styles.workspace}>
        <div className={`${styles.desktopRail} ${isSidebarOpen ? styles.desktopRailOpen : ''}`}>
          <aside className={`${styles.desktopSidebar} ${isSidebarOpen ? styles.desktopSidebarOpen : ''}`}>
            <SidebarPanel
              activeChatId={activeChatId}
              chats={chats}
              error={sidebarError}
              isLoading={isSidebarLoading}
              onCreateChat={onCreateChat}
              onSelectChat={onSelectChat}
            />
          </aside>
        </div>

        <div className={styles.chatArea}>
          <ChatPanel
            chatId={activeChatId}
            error={chatError}
            isPending={isChatPending}
            messages={messages}
            onSendMessage={onSendMessage}
            title={activeChatTitle}
          />
        </div>
      </div>

      <button
        aria-hidden={!isSidebarOpen}
        aria-label="Закрыть overlay чатов"
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
        type="button"
        onClick={onCloseSidebar}
      />

      <div
        aria-hidden={!isSidebarOpen}
        className={`${styles.mobileDrawer} ${isSidebarOpen ? styles.mobileDrawerVisible : ''}`}
      >
        <SidebarPanel
          activeChatId={activeChatId}
          chats={chats}
          error={sidebarError}
          isLoading={isSidebarLoading}
          onCreateChat={onCreateChat}
          onSelectChat={onSelectChat}
        />
      </div>
    </section>
  )
}
