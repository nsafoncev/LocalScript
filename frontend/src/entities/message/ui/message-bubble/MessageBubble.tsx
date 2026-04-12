import { useState, type JSX } from 'react'
import type { ChatMessage } from '../../model/types'
import { copyText } from '../../../../shared/lib/copy'
import { extractCodeText } from '../../../../shared/lib/message-format'
import type { AppTheme } from '../../../../shared/lib/theme/types'
import { MessageActions, MessageContent } from '../../../../shared/ui'
import styles from './MessageBubble.module.scss'

type MessageBubbleProps = {
  message: ChatMessage
  theme: AppTheme
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function MessageBubble({
  message,
  theme,
}: MessageBubbleProps): JSX.Element {
  const isUser = message.role === 'user'
  const [isMessageCopied, setIsMessageCopied] = useState(false)
  const [isCodeCopied, setIsCodeCopied] = useState(false)

  function showCopiedState(target: 'message' | 'code'): void {
    if (target === 'message') {
      setIsMessageCopied(true)

      globalThis.setTimeout(() => {
        setIsMessageCopied(false)
      }, 1600)

      return
    }

    setIsCodeCopied(true)

    globalThis.setTimeout(() => {
      setIsCodeCopied(false)
    }, 1600)
  }

  async function handleCopyMessage(): Promise<void> {
    const isSuccess = await copyText(message.text)

    if (!isSuccess) {
      return
    }

    showCopiedState('message')
  }

  async function handleCopyCode(): Promise<void> {
    const isSuccess = await copyText(extractCodeText(message.text))

    if (!isSuccess) {
      return
    }

    showCopiedState('code')
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
        <MessageContent
          codeCopyStatus={isCodeCopied ? 'Код скопирован' : null}
          format={message.format}
          text={message.text}
          theme={theme}
          onCopyCode={
            !isUser && message.format === 'code'
              ? () => {
                  void handleCopyCode()
                }
              : undefined
          }
        />
      </div>
      <div className={styles.actions}>
        <MessageActions
          copyLabel="Скопировать сообщение"
          statusText={isMessageCopied ? 'Сообщение скопировано' : null}
          theme={theme}
          onCopy={() => {
            void handleCopyMessage()
          }}
        />
      </div>
    </article>
  )
}
