import type { JSX } from 'react'
import styles from './ChatScrollButton.module.scss'

type ChatScrollButtonProps = {
  onClick: () => void
}

export function ChatScrollButton({
  onClick,
}: ChatScrollButtonProps): JSX.Element {
  return (
    <button
      aria-label="Прокрутить чат вниз"
      className={styles.button}
      type="button"
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        className={styles.icon}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 20V4M12 4L18 10M12 4L6 10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  )
}
