import type { JSX, ReactNode } from 'react'
import { normalizeAssistantMarkdown, parseMarkdown } from '../../lib/markdown'
import styles from './MessageContent.module.scss'

type MessageContentProps = {
  text: string
}

function renderTextWithBreaks(value: string): ReactNode {
  return value.split('\n').map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

export function MessageContent({ text }: MessageContentProps): JSX.Element {
  const markdown = normalizeAssistantMarkdown(text)
  const blocks = parseMarkdown(markdown)

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return (
            <pre className={styles.codeBlock} key={`code-${index}`}>
              <code className={styles.code}>{block.code}</code>
            </pre>
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
