import type { JSX } from 'react'
import type { ChatMessage } from '../../../../entities/message'
import { MessageList } from '../../../../entities/message'
import type { AppTheme } from '../../../../shared/lib/theme/types'
import { Panel } from '../../../../shared/ui'
import { ChatEmptyState } from '../chat-empty-state/ChatEmptyState'
import { ChatInput } from '../chat-input/ChatInput'
import { ChatLoading } from '../chat-loading/ChatLoading'
import styles from './ChatPanel.module.scss'

type ChatPanelProps = {
  chatId: string | null
  title: string
  hasChats: boolean
  messages: readonly ChatMessage[]
  isPending: boolean
  error: string | null
  theme: AppTheme
  onSendMessage: (value: string) => Promise<void>
  onStopGenerating: () => void
}

export function ChatPanel({
  chatId,
  title,
  hasChats,
  messages,
  isPending,
  error,
  theme,
  onSendMessage,
  onStopGenerating,
}: ChatPanelProps): JSX.Element {
  const hasMessages = messages.length > 0
  const input = (
    <ChatInput
      key={chatId ?? 'chat-input-empty'}
      isPending={isPending}
      onSend={onSendMessage}
      onStopGenerating={onStopGenerating}
    />
  )

  if (!hasMessages) {
    return (
      <Panel className={`${styles.panel} ${styles.panelEmpty}`}>
        <div className={styles.emptyViewport}>
          <ChatEmptyState hasChats={hasChats} />
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.emptyComposer}>{input}</div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.body}>
        <div className={styles.messagesViewport}>
          <div className={styles.messages}>
            <MessageList messages={messages} theme={theme} />
            {isPending ? (
              <div className={styles.loadingRow}>
                <ChatLoading />
              </div>
            ) : null}
          </div>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
      <div className={styles.footer}>{input}</div>
    </Panel>
  )
}
