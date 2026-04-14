import type { JSX, ReactNode, RefObject } from 'react'
import type { AppTheme } from '../../../../shared/lib/theme/types'
import type { ChatMessage } from '../../model/types'
import { MessageBubble } from '../message-bubble/MessageBubble'
import styles from './MessageList.module.scss'

type MessageListProps = {
  messages: readonly ChatMessage[]
  theme: AppTheme
  bottomAnchorRef: RefObject<HTMLDivElement | null>
  pendingContent?: ReactNode
}

export function MessageList({
  messages,
  theme,
  bottomAnchorRef,
  pendingContent = null,
}: MessageListProps): JSX.Element {
  return (
    <div className={styles.list} aria-live="polite">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} theme={theme} />
      ))}
      {pendingContent}
      <div ref={bottomAnchorRef} />
    </div>
  )
}
