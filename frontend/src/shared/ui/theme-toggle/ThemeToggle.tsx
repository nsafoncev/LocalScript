import type { JSX } from 'react'
import type { AppTheme } from '../../lib/theme/types'
import styles from './ThemeToggle.module.scss'

type ThemeToggleProps = {
  theme: AppTheme
  onToggle: () => void
}

export function ThemeToggle({
  theme,
  onToggle,
}: ThemeToggleProps): JSX.Element {
  const isDarkTheme = theme === 'dark'

  return (
    <button
      aria-checked={isDarkTheme}
      aria-label="Переключить тему"
      className={styles.toggle}
      role="switch"
      type="button"
      onClick={onToggle}
    >
      <span className={styles.track}>
        <span className={styles.option}>
          <span className={styles.optionFull}>Светлая</span>
          <span className={styles.optionCompact}>Свет</span>
        </span>
        <span className={styles.option}>
          <span className={styles.optionFull}>Тёмная</span>
          <span className={styles.optionCompact}>Тьма</span>
        </span>
        <span
          className={`${styles.thumb} ${isDarkTheme ? styles.thumbDark : ''}`}
        />
      </span>
    </button>
  )
}
