import type { ButtonHTMLAttributes, JSX } from 'react'
import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = {
  variant?: ButtonVariant
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element {
  const classNames = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} type={type} {...props}>
      {children}
    </button>
  )
}
