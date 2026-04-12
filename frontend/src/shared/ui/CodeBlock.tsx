import type { JSX } from 'react'
import type { AppTheme } from '../lib/theme/types'
import { CopyIconButton } from './CopyIconButton'
import styles from './CodeBlock.module.scss'

type CodeBlockProps = {
  code: string
  theme: AppTheme
  onCopyCode?: () => void
  copyStatus: string | null
}

export function CodeBlock({
  code,
  theme,
  onCopyCode,
  copyStatus,
}: CodeBlockProps): JSX.Element {
  return (
    <div className={styles.block}>
      {onCopyCode ? (
        <div className={styles.toolbar}>
          {copyStatus ? <span className={styles.status}>{copyStatus}</span> : null}
          <CopyIconButton
            theme={theme}
            label="Скопировать код"
            onClick={onCopyCode}
          />
        </div>
      ) : null}
      <div className={styles.viewport}>
        <pre className={styles.code}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
