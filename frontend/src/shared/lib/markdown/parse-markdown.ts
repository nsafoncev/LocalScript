import type { MarkdownBlock, MarkdownInlineNode } from './types'

const CODE_BLOCK_PATTERN = /```([\w-]+)?\n([\s\S]*?)```/g

function parseInlineNodes(value: string): readonly MarkdownInlineNode[] {
  const nodes: MarkdownInlineNode[] = []
  const inlineCodePattern = /`([^`]+)`/g
  let lastIndex = 0

  for (const match of value.matchAll(inlineCodePattern)) {
    const matchIndex = match.index ?? 0
    const textChunk = value.slice(lastIndex, matchIndex)

    if (textChunk) {
      nodes.push({
        type: 'text',
        value: textChunk,
      })
    }

    const codeChunk = match[1]

    if (codeChunk) {
      nodes.push({
        type: 'code',
        value: codeChunk,
      })
    }

    lastIndex = matchIndex + match[0].length
  }

  const tail = value.slice(lastIndex)

  if (tail) {
    nodes.push({
      type: 'text',
      value: tail,
    })
  }

  return nodes
}

function parseParagraphs(value: string): readonly MarkdownBlock[] {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph' as const,
      nodes: parseInlineNodes(paragraph),
    }))
}

export function parseMarkdown(markdown: string): readonly MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  let lastIndex = 0

  for (const match of markdown.matchAll(CODE_BLOCK_PATTERN)) {
    const matchIndex = match.index ?? 0
    const textChunk = markdown.slice(lastIndex, matchIndex)

    blocks.push(...parseParagraphs(textChunk))
    blocks.push({
      type: 'code',
      language: match[1] ?? null,
      code: match[2] ?? '',
    })
    lastIndex = matchIndex + match[0].length
  }

  const tail = markdown.slice(lastIndex)
  blocks.push(...parseParagraphs(tail))

  return blocks
}
