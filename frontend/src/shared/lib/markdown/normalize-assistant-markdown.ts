const CODE_HINT_PATTERNS: readonly RegExp[] = [
  /\b(function|const|let|var|class|interface|type|return|import|export)\b/,
  /\b(def|lambda|print|from|async|await|elif|except)\b/,
  /\b(public|private|protected|static|void|new)\b/,
  /\b(if|for|while|switch)\s*\(/,
  /=>/,
  /<\/?[a-z][^>]*>/i,
]

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n')
}

function hasCodeIndentation(lines: readonly string[]): boolean {
  return lines.some((line) => /^(  |\t)/.test(line))
}

function hasCodePunctuation(lines: readonly string[]): boolean {
  return lines.some((line) => /[{};()[\]]/.test(line))
}

function isProbablyCode(value: string): boolean {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return false
  }

  if (trimmedValue.includes('```')) {
    return true
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

export function normalizeAssistantMarkdown(text: string): string {
  const normalizedText = normalizeLineEndings(text).trim()

  if (!normalizedText) {
    return ''
  }

  if (!isProbablyCode(normalizedText)) {
    return normalizedText
  }

  if (normalizedText.includes('```')) {
    return normalizedText
  }

  return ['```', normalizedText, '```'].join('\n')
}

export function hasMarkdownCode(text: string): boolean {
  const normalizedText = normalizeAssistantMarkdown(text)

  return normalizedText.includes('```') || /`[^`]+`/.test(normalizedText)
}
