import type { JSX } from 'react'
import type { AppTheme } from '../lib/theme/types'
import styles from './CopyIconButton.module.scss'

type CopyIconButtonProps = {
  theme: AppTheme
  label: string
  disabled?: boolean
  onClick: () => void
}

function getCopyIconPath(theme: AppTheme): string {
  return theme === 'dark' ? '/copy-icon-white.svg' : '/copy-icon-black.svg'
}

export function CopyIconButton({
  theme,
  label,
  disabled = false,
  onClick,
}: CopyIconButtonProps): JSX.Element {
  return (
    <button
      aria-label={label}
      className={styles.button}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <img
        alt=""
        aria-hidden="true"
        className={styles.icon}
        height="16"
        src={getCopyIconPath(theme)}
        width="16"
      />
    </button>
  )
}
