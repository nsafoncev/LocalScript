function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n')
}

export function normalizeAssistantMarkdown(text: string): string {
  return normalizeLineEndings(text).trim()
}

export function hasMarkdownCode(text: string): boolean {
  const normalizedText = normalizeAssistantMarkdown(text)

  return normalizedText.includes('```') || /`[^`]+`/.test(normalizedText)
}
