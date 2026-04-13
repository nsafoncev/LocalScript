import { useEffect, useRef, type JSX, type ReactNode } from 'react'
import type { AppTheme } from '../../../../shared/lib/theme/types'
import type { ChatMessage } from '../../model/types'
import { MessageBubble } from '../message-bubble/MessageBubble'
import styles from './MessageList.module.scss'

type MessageListProps = {
  messages: readonly ChatMessage[]
  theme: AppTheme
  pendingContent?: ReactNode
}

export function MessageList({
  messages,
  theme,
  pendingContent = null,
}: MessageListProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages.length, pendingContent])

  return (
    <div className={styles.list} aria-live="polite">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} theme={theme} />
      ))}
      {pendingContent}
      <div ref={bottomRef} />
    </div>
  )
}
