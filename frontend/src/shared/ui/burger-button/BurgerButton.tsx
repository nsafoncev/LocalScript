import type { ButtonHTMLAttributes, JSX } from 'react'
import styles from './BurgerButton.module.scss'

type BurgerButtonProps = {
  isActive: boolean
  label: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function BurgerButton({
  className,
  isActive,
  label,
  type = 'button',
  ...props
}: BurgerButtonProps): JSX.Element {
  const classNames = [styles.button, isActive ? styles.active : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-label={label}
      aria-pressed={isActive}
      className={classNames}
      data-state={isActive ? 'active' : 'idle'}
      type={type}
      {...props}
    >
      <span className={styles.lines} aria-hidden="true">
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.line} />
      </span>
    </button>
  )
}
