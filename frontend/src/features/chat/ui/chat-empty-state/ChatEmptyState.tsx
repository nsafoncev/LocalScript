import type { JSX } from 'react'
import styles from './ChatEmptyState.module.scss'

export function ChatEmptyState(): JSX.Element {
  return (
    <section className={styles.empty}>
      <h2 className={styles.title}>Начните диалог</h2>
      <p className={styles.description}>Сформулируйте запрос, и я помогу с ответом.</p>
    </section>
  )
}
