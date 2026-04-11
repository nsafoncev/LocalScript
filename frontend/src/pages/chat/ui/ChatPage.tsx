import type { JSX } from 'react'
import type { AppTheme } from '../../../shared/lib/theme/types'
import { ChatLayout } from '../../../widgets/chat-layout'
import { useChatWorkspace } from '../model/use-chat-workspace'
import styles from './ChatPage.module.scss'

type ChatPageProps = {
  theme: AppTheme
  toggleTheme: () => void
}

export function ChatPage({
  theme,
  toggleTheme,
}: ChatPageProps): JSX.Element {
  const {
    activeChatId,
    activeChatTitle,
    chatError,
    chats,
    closeSidebar,
    createChat,
    isChatPending,
    isSidebarLoading,
    isSidebarOpen,
    messages,
    selectChat,
    sendMessage,
    sidebarError,
    toggleSidebar,
  } = useChatWorkspace()

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />
      <section className={styles.shell}>
        <ChatLayout
          activeChatId={activeChatId}
          activeChatTitle={activeChatTitle}
          chatError={chatError}
          chats={chats}
          isChatPending={isChatPending}
          isSidebarLoading={isSidebarLoading}
          isSidebarOpen={isSidebarOpen}
          messages={messages}
          onCloseSidebar={closeSidebar}
          onCreateChat={createChat}
          onSelectChat={selectChat}
          onSendMessage={sendMessage}
          onToggleSidebar={toggleSidebar}
          sidebarError={sidebarError}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </section>
    </main>
  )
}
