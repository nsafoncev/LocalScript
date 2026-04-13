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

function decodeEscapedSequences(value: string): string {
  return value
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
}

function isLuaWrapper(value: string): boolean {
  return /^lua\{[\s\S]*\}lua$/u.test(value.trim())
}

function shouldIncreaseIndent(line: string): boolean {
  return /\b(then|do|function)\s*$/u.test(line.trim())
}

function shouldDecreaseIndent(line: string): boolean {
  return /^(end|else\b|elseif\b)/u.test(line.trim())
}

function expandLuaStatements(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()

  if (!normalized || normalized.includes('\n')) {
    return normalized
  }

  return normalized
    .replace(/\s+(local function\b)/gu, '\n$1')
    .replace(/\s+(function\b)/gu, '\n$1')
    .replace(/\s+(for\b)/gu, '\n$1')
    .replace(/\s+(if\b)/gu, '\n$1')
    .replace(/\s+(while\b)/gu, '\n$1')
    .replace(/\s+(repeat\b)/gu, '\n$1')
    .replace(/\s+(return\b)/gu, '\n$1')
    .replace(/\s+(end\b)/gu, '\n$1')
    .replace(/\s+(else\b)/gu, '\n$1')
    .replace(/\s+(elseif\b)/gu, '\n$1')
}

function formatLuaWrapper(value: string): string {
  const trimmedValue = normalizeLineEndings(decodeEscapedSequences(value)).trim()
  const match = trimmedValue.match(/^lua\{([\s\S]*)\}lua$/u)

  if (!match) {
    return trimmedValue
  }

  const inner = expandLuaStatements(match[1]?.trim() ?? '')
  if (!inner) {
    return 'lua{\n}lua'
  }

  const lines = inner
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let indentLevel = 0
  const formattedLines = lines.map((line) => {
    if (shouldDecreaseIndent(line)) {
      indentLevel = Math.max(indentLevel - 1, 0)
    }

    const formattedLine = `${'  '.repeat(indentLevel)}${line}`

    if (shouldIncreaseIndent(line)) {
      indentLevel += 1
    }

    if (/^(else\b|elseif\b)/u.test(line.trim())) {
      indentLevel += 1
    }

    return formattedLine
  })

  return `lua{\n${formattedLines.join('\n')}\n}lua`
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
  const normalizedText = normalizeLineEndings(decodeEscapedSequences(text)).trim()
  const match = normalizedText.match(CODE_BLOCK_PATTERN)

  if (!match) {
    return isLuaWrapper(normalizedText)
      ? formatLuaWrapper(normalizedText)
      : normalizedText
  }

  const code = decodeEscapedSequences(match[2]?.replace(/\n$/u, '') ?? '')
  return isLuaWrapper(code) ? formatLuaWrapper(code) : code
}
