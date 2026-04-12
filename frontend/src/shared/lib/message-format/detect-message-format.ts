import type { MessageFormat } from './types'

const CODE_HINT_PATTERNS: readonly RegExp[] = [
  /\b(function|const|let|var|class|interface|type|return|import|export)\b/u,
  /\b(def|lambda|print|from|async|await|elif|except)\b/u,
  /\b(public|private|protected|static|void|new)\b/u,
  /\b(if|for|while|switch)\s*\(/u,
  /=>/u,
  /<\/?[a-z][^>]*>/iu,
]

const FENCED_CODE_BLOCK_PATTERN = /^```([\w-]+)?\n[\s\S]*?\n?```$/u
const CODE_BLOCK_PATTERN = /```([\w-]+)?\n([\s\S]*?)```/u

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n')
}

function hasCodeIndentation(lines: readonly string[]): boolean {
  return lines.some((line) => /^( {2}|\t)/u.test(line))
}

function hasCodePunctuation(lines: readonly string[]): boolean {
  return lines.some((line) => /[{};()[\]]/u.test(line))
}

function isProbablyCode(value: string): boolean {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return false
  }

  if (trimmedValue.includes('```')) {
    return FENCED_CODE_BLOCK_PATTERN.test(trimmedValue)
  }

  if (CODE_HINT_PATTERNS.some((pattern) => pattern.test(trimmedValue))) {
    return true
  }

  const lines = trimmedValue
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)

  if (lines.length < 2) {
    return false
  }

  return hasCodeIndentation(lines) || hasCodePunctuation(lines)
}

export function detectMessageFormat(text: string): MessageFormat {
  return isProbablyCode(normalizeLineEndings(text)) ? 'code' : 'text'
}

export function extractCodeText(text: string): string {
  const normalizedText = normalizeLineEndings(text).trim()
  const match = normalizedText.match(CODE_BLOCK_PATTERN)

  if (!match) {
    return normalizedText
  }

  return match[2]?.replace(/\n$/u, '') ?? ''
}
