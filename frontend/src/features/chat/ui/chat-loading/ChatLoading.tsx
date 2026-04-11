import type { JSX } from 'react'
import styles from './ChatLoading.module.scss'

export function ChatLoading(): JSX.Element {
  return (
    <div className={styles.loading} aria-label="Думаю">
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <span className={styles.label}>Думаю...</span>
    </div>
  )
}
