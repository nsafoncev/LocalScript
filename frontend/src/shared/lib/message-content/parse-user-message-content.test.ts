import { describe, expect, it } from 'vitest'
import { parseUserMessageContent } from './parse-user-message-content'

describe('parseUserMessageContent', () => {
  it('keeps plain text outside fenced code blocks as paragraphs', () => {
    expect(
      parseUserMessageContent(
        'Вот данные:\n\n```json\n{\n  "count": 2\n}\n```\n\nПроверь их.',
      ),
    ).toEqual([
      {
        type: 'paragraph',
        text: 'Вот данные:',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "count": 2\n}\n',
      },
      {
        type: 'paragraph',
        text: 'Проверь их.',
      },
    ])
  })

  it('returns a single paragraph when fenced code blocks are absent', () => {
    expect(parseUserMessageContent('Обычный текст без markdown.')).toEqual([
      {
        type: 'paragraph',
        text: 'Обычный текст без markdown.',
      },
    ])
  })
})
