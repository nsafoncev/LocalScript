import { useEffect, useRef, type JSX } from 'react'
import type { AppTheme } from '../../../../shared/lib/theme/types'
import type { ChatMessage } from '../../model/types'
import { MessageBubble } from '../message-bubble/MessageBubble'
import styles from './MessageList.module.scss'

type MessageListProps = {
  messages: readonly ChatMessage[]
  theme: AppTheme
}

export function MessageList({
  messages,
  theme,
}: MessageListProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  return (
    <div className={styles.list} aria-live="polite">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} theme={theme} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
