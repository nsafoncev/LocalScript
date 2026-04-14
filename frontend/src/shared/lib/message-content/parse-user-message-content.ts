import type { UserMessageContentBlock } from './types'

const CODE_BLOCK_PATTERN = /```([\w-]+)?\n([\s\S]*?)```/g

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n')
}

function createParagraphBlocks(value: string): readonly UserMessageContentBlock[] {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph' as const,
      text: paragraph,
    }))
}

export function parseUserMessageContent(
  text: string,
): readonly UserMessageContentBlock[] {
  const normalizedText = normalizeLineEndings(text).trim()

  if (!normalizedText) {
    return []
  }

  const blocks: UserMessageContentBlock[] = []
  let lastIndex = 0

  for (const match of normalizedText.matchAll(CODE_BLOCK_PATTERN)) {
    const matchIndex = match.index ?? 0
    const textChunk = normalizedText.slice(lastIndex, matchIndex)

    blocks.push(...createParagraphBlocks(textChunk))
    blocks.push({
      type: 'code',
      language: match[1] ?? null,
      code: match[2] ?? '',
    })

    lastIndex = matchIndex + match[0].length
  }

  const tail = normalizedText.slice(lastIndex)
  blocks.push(...createParagraphBlocks(tail))

  return blocks
}
