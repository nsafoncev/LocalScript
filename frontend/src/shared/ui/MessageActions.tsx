import type { JSX } from 'react'
import type { AppTheme } from '../lib/theme/types'
import { CopyIconButton } from './CopyIconButton'
import styles from './MessageActions.module.scss'

type MessageActionsProps = {
  theme: AppTheme
  copyLabel: string
  statusText: string | null
  onCopy: () => void
}

export function MessageActions({
  theme,
  copyLabel,
  statusText,
  onCopy,
}: MessageActionsProps): JSX.Element {
  return (
    <div className={styles.actions}>
      {statusText ? <span className={styles.status}>{statusText}</span> : null}
      <CopyIconButton theme={theme} label={copyLabel} onClick={onCopy} />
    </div>
  )
}
