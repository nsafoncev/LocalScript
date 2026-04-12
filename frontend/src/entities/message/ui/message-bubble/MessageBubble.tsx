import { useState, type JSX } from 'react'
import type { ChatMessage } from '../../model/types'
import { copyText } from '../../../../shared/lib/copy/copy-text'
import { hasMarkdownCode } from '../../../../shared/lib/markdown'
import { MessageContent } from '../../../../shared/ui'
import styles from './MessageBubble.module.scss'

type MessageBubbleProps = {
  message: ChatMessage
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function MessageBubble({
  message,
}: MessageBubbleProps): JSX.Element {
  const isUser = message.role === 'user'
  const [isCopied, setIsCopied] = useState(false)
  const canCopyMessage = !isUser && hasMarkdownCode(message.text)

  async function handleCopy(): Promise<void> {
    const isSuccess = await copyText(message.text)

    if (!isSuccess) {
      return
    }

    setIsCopied(true)

    globalThis.setTimeout(() => {
      setIsCopied(false)
    }, 1600)
  }

  return (
    <article
      className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}
    >
      <div className={styles.meta}>
        <span className={styles.role}>{isUser ? 'Вы' : 'Ассистент'}</span>
        <time className={styles.time} dateTime={message.createdAt}>
          {formatTime(message.createdAt)}
        </time>
      </div>
      <div className={styles.text}>
        <MessageContent text={message.text} />
      </div>
      {canCopyMessage ? (
        <div className={styles.actions}>
          <button
            className={styles.copyButton}
            type="button"
            onClick={() => {
              void handleCopy()
            }}
          >
            {isCopied ? 'Скопировано' : 'Скопировать'}
          </button>
        </div>
      ) : null}
    </article>
  )
}
