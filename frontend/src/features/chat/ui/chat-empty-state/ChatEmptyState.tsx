import type { JSX } from 'react'
import styles from './ChatEmptyState.module.scss'

type ChatEmptyStateProps = {
  hasChats: boolean
}

export function ChatEmptyState({
  hasChats,
}: ChatEmptyStateProps): JSX.Element {
  return (
    <section className={styles.empty}>
      <span className={styles.eyebrow}>
        {hasChats ? 'Новый диалог' : 'AI-чат'}
      </span>
      <h2 className={styles.title}>
        {hasChats ? 'Сформулируйте запрос' : 'Чем помочь?'}
      </h2>
    </section>
  )
}
