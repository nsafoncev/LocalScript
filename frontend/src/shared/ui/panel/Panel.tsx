import type { HTMLAttributes, JSX, ReactNode } from 'react'
import styles from './Panel.module.scss'

type PanelProps = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

export function Panel({
  children,
  className,
  ...props
}: PanelProps): JSX.Element {
  const classNames = [styles.panel, className].filter(Boolean).join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}
