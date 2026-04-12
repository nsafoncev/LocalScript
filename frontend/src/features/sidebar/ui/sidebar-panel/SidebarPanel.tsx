import type { JSX } from 'react'
import type { ChatPreview } from '../../../../entities/chat'
import { Button, Panel } from '../../../../shared/ui'
import styles from './SidebarPanel.module.scss'

type SidebarPanelProps = {
  chats: readonly ChatPreview[]
  activeChatId: string | null
  isLoading: boolean
  error: string | null
  onCreateChat: () => void
  onSelectChat: (chatId: string) => void
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function SidebarPanel({
  chats,
  activeChatId,
  isLoading,
  error,
  onCreateChat,
  onSelectChat,
}: SidebarPanelProps): JSX.Element {
  return (
    <Panel className={styles.sidebar}>
      <div className={styles.topBar}>
        <div>
          <p className={styles.kicker}>История</p>
          <span className={styles.brand}>Диалоги</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button className={styles.newChatButton} onClick={onCreateChat} variant="secondary">
          Новый чат
        </Button>
      </div>

      <div className={styles.list}>
        {isLoading ? <p className={styles.info}>Загружаю список чатов...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
        {!isLoading && chats.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.info}>Чатов пока нет</p>
            <p className={styles.infoHint}>Создайте новый диалог, когда будете готовы.</p>
          </div>
        ) : null}
        {chats.map((chat) => {
          const isActive = chat.id === activeChatId

          return (
            <button
              aria-pressed={isActive}
              key={chat.id}
              className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
              title={chat.title}
              type="button"
              onClick={() => onSelectChat(chat.id)}
            >
              <span className={styles.avatar}>
                {chat.title.slice(0, 1).toUpperCase()}
              </span>
              <span className={styles.content}>
                <span className={styles.itemTop}>
                  <span className={styles.itemTitle}>{chat.title}</span>
                  <span className={styles.itemDate}>{formatDate(chat.updatedAt)}</span>
                </span>
                <span className={styles.itemPreview}>{chat.lastMessage}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
