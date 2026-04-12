import { describe, expect, it } from 'vitest'
import {
  detectMessageFormat,
  extractCodeText,
} from './detect-message-format'

describe('detectMessageFormat', () => {
  it('returns code for raw code response', () => {
    expect(
      detectMessageFormat('const total = items.length\nreturn total'),
    ).toBe('code')
  })

  it('returns text for plain assistant message', () => {
    expect(
      detectMessageFormat('Нужно уточнить формат данных и целевую платформу.'),
    ).toBe('text')
  })

  it('treats fenced code block as code-only response', () => {
    expect(detectMessageFormat('```ts\nconst answer = 42\n```')).toBe('code')
  })
})

describe('extractCodeText', () => {
  it('returns code body without fences', () => {
    expect(extractCodeText('```ts\nconst answer = 42\n```')).toBe(
      'const answer = 42',
    )
  })
})
