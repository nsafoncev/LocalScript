import type { JSX } from 'react'
import type { ChatMessage } from '../../../../entities/message'
import { MessageList } from '../../../../entities/message'
import { Panel } from '../../../../shared/ui'
import { ChatEmptyState } from '../chat-empty-state/ChatEmptyState'
import { ChatInput } from '../chat-input/ChatInput'
import { ChatLoading } from '../chat-loading/ChatLoading'
import styles from './ChatPanel.module.scss'

type ChatPanelProps = {
  chatId: string | null
  title: string
  messages: readonly ChatMessage[]
  isPending: boolean
  error: string | null
  onSendMessage: (value: string) => Promise<void>
}

export function ChatPanel({
  chatId,
  title,
  messages,
  isPending,
  error,
  onSendMessage,
}: ChatPanelProps): JSX.Element {
  const hasMessages = messages.length > 0
  const input = (
    <ChatInput
      key={chatId ?? 'chat-input-empty'}
      disabled={isPending}
      onSend={onSendMessage}
    />
  )

  if (!hasMessages) {
    return (
      <Panel className={`${styles.panel} ${styles.panelEmpty}`}>
        <div className={styles.emptyViewport}>
          <ChatEmptyState />
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
        <div className={styles.messages}>
          <MessageList messages={messages} />
          {isPending ? (
            <div className={styles.loadingRow}>
              <ChatLoading />
            </div>
          ) : null}
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
      <div className={styles.footer}>{input}</div>
    </Panel>
  )
}
