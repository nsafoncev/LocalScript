import type { JSX, ReactNode } from 'react'
import type { MessageRole } from '../../../entities/message'
import { parseUserMessageContent } from '../../lib/message-content'
import type { MessageFormat } from '../../lib/message-format'
import { normalizeAssistantMarkdown, parseMarkdown } from '../../lib/markdown'
import type { AppTheme } from '../../lib/theme/types'
import { CodeBlock } from '../CodeBlock'
import styles from './MessageContent.module.scss'

type MessageContentProps = {
  text: string
  format: MessageFormat
  role: MessageRole
  theme: AppTheme
  codeCopyStatus?: string | null
  onCopyCode?: () => void
}

function renderTextWithBreaks(value: string): ReactNode {
  return value.split('\n').map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

export function MessageContent({
  text,
  format,
  role,
  theme,
  codeCopyStatus = null,
  onCopyCode,
}: MessageContentProps): JSX.Element {
  if (format === 'code') {
    return (
      <div className={styles.content}>
        <CodeBlock
          code={text}
          copyStatus={codeCopyStatus}
          theme={theme}
          onCopyCode={onCopyCode}
        />
      </div>
    )
  }

  if (role === 'user') {
    const blocks = parseUserMessageContent(text)

    return (
      <div className={styles.content}>
        {blocks.map((block, index) => {
          if (block.type === 'code') {
            return (
              <CodeBlock
                code={block.code}
                copyStatus={null}
                key={`user-code-${index}`}
                theme={theme}
              />
            )
          }

          return (
            <p className={styles.paragraph} key={`user-paragraph-${index}`}>
              {renderTextWithBreaks(block.text)}
            </p>
          )
        })}
      </div>
    )
  }

  const markdown = normalizeAssistantMarkdown(text)
  const blocks = parseMarkdown(markdown)

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return (
            <CodeBlock
              code={block.code}
              copyStatus={null}
              key={`code-${index}`}
              theme={theme}
            />
          )
        }

        return (
          <p className={styles.paragraph} key={`paragraph-${index}`}>
            {block.nodes.map((node, nodeIndex) =>
              node.type === 'code' ? (
                <code className={styles.inlineCode} key={`code-${nodeIndex}`}>
                  {node.value}
                </code>
              ) : (
                <span key={`text-${nodeIndex}`}>
                  {renderTextWithBreaks(node.value)}
                </span>
              ),
            )}
          </p>
        )
      })}
    </div>
  )
}
