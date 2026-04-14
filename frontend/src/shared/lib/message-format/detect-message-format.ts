import type { MessageFormat } from './types'

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
  const trimmedLine = line.trim()

  return (
    /^(local\s+function\b|function\b|repeat\b)/u.test(trimmedLine) ||
    /\b(then|do)\s*$/u.test(trimmedLine)
  )
}

function shouldDecreaseIndent(line: string): boolean {
  return /^(end|else\b|elseif\b)/u.test(line.trim())
}

function splitCompactLuaLine(line: string): string[] {
  const expanded = line
    .replace(/\b(local function|function|for|if|while|repeat|return|end|else|elseif)\b/gu, '\n$1')
    .replace(/\b(then|do)\s+(?=\S)/gu, '$1\n')
    .replace(/\belse\s+(?=\S)/gu, 'else\n')

  return expanded
    .split('\n')
    .map((part) => part.trim())
    .filter(Boolean)
}

function expandLuaStatements(value: string): string {
  const normalized = normalizeLineEndings(value).trim()

  if (!normalized) {
    return normalized
  }

  const lines = normalized
    .split('\n')
    .flatMap((line) => splitCompactLuaLine(line))

  return lines.join('\n')
}

function formatLuaWrapper(value: string): string {
  const trimmedValue = normalizeLineEndings(decodeEscapedSequences(value)).trim()
  const match = trimmedValue.match(/^lua\{([\s\S]*)\}lua$/u)

  if (!match) {
    return trimmedValue
  }

  const inner = expandLuaStatements(match[1]?.trim() ?? '')
  if (!inner) {
    return ''
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

    if (/^else\b/u.test(line.trim())) {
      indentLevel += 1
    } else if (/^elseif\b/u.test(line.trim()) && /\bthen\s*$/u.test(line.trim())) {
      indentLevel += 1
    } else if (shouldIncreaseIndent(line)) {
      indentLevel += 1
    }

    return formattedLine
  })

  return formattedLines.join('\n')
}

function isProbablyCode(value: string): boolean {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return false
  }

  if (trimmedValue.includes('```')) {
    return FENCED_CODE_BLOCK_PATTERN.test(trimmedValue)
  }

  return isLuaWrapper(trimmedValue)
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
