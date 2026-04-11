import type { JSX } from 'react'
import type { ChatMessage } from '../../model/types'
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
      <p className={styles.text}>{message.text}</p>
    </article>
  )
}
