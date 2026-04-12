import { describe, expect, it } from 'vitest'
import {
  hasMarkdownCode,
  normalizeAssistantMarkdown,
} from './normalize-assistant-markdown'

describe('normalizeAssistantMarkdown', () => {
  it('keeps regular text without markdown changes', () => {
    expect(normalizeAssistantMarkdown('Краткий ответ без кода.')).toBe(
      'Краткий ответ без кода.',
    )
  })

  it('keeps raw code unchanged after format detection moved to model layer', () => {
    expect(
      normalizeAssistantMarkdown(
        'function sum(a, b) {\n  return a + b\n}',
      ),
    ).toBe('function sum(a, b) {\n  return a + b\n}')
  })

  it('detects markdown code for copy action', () => {
    expect(hasMarkdownCode('Используйте `npm run build`')).toBe(true)
    expect(hasMarkdownCode('Просто текст')).toBe(false)
  })
})
