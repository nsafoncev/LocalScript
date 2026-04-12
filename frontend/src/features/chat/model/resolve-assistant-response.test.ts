import { describe, expect, it } from 'vitest'
import { resolveAssistantResponse } from './resolve-assistant-response'

describe('resolveAssistantResponse', () => {
  it('returns code format for backend code field', () => {
    expect(
      resolveAssistantResponse({
        code: '```ts\nconst answer = 42\n```',
      }),
    ).toEqual({
      format: 'code',
      text: 'const answer = 42',
    })
  })

  it('keeps plain text response as text', () => {
    expect(
      resolveAssistantResponse({
        text: 'Нужно уточнить формат входных данных.',
      }),
    ).toEqual({
      format: 'text',
      text: 'Нужно уточнить формат входных данных.',
    })
  })
})
