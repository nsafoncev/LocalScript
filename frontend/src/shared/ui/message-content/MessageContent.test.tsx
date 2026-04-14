import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MessageContent } from './MessageContent'

describe('MessageContent', () => {
  it('renders fenced code blocks', () => {
    render(
      <MessageContent
        format="text"
        role="assistant"
        text={'```ts\nconst answer = 42\n```'}
        theme="light"
      />,
    )

    expect(screen.getByText('const answer = 42')).toBeInTheDocument()
  })

  it('renders inline code inside an assistant paragraph', () => {
    render(
      <MessageContent
        format="text"
        role="assistant"
        text="Запустите `npm run dev` и проверьте результат."
        theme="light"
      />,
    )

    expect(screen.getByText('npm run dev')).toBeInTheDocument()
    expect(screen.getByText(/запустите/i)).toBeInTheDocument()
  })

  it('renders code-only message as standalone code block', () => {
    render(
      <MessageContent
        format="code"
        role="assistant"
        text={'const total = items.length\nreturn total'}
        theme="dark"
      />,
    )

    expect(screen.getByText(/const total = items\.length/i)).toBeInTheDocument()
    expect(screen.getByText(/return total/i)).toBeInTheDocument()
  })

  it('renders user message with fenced code block without converting surrounding text into code', () => {
    render(
      <MessageContent
        format="text"
        role="user"
        text={'Вот данные:\n\n```json\n{\n  "wf": true\n}\n```\n\nПроверь их.'}
        theme="light"
      />,
    )

    expect(screen.getByText('Вот данные:')).toBeInTheDocument()
    expect(screen.getByText('{')).toBeInTheDocument()
    expect(screen.getByText(/"wf": true/)).toBeInTheDocument()
    expect(screen.getByText('Проверь их.')).toBeInTheDocument()
  })
})
