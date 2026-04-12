import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MessageContent } from './MessageContent'

describe('MessageContent', () => {
  it('renders fenced code blocks', () => {
    render(
      <MessageContent
        format="text"
        text={'```ts\nconst answer = 42\n```'}
        theme="light"
      />,
    )

    expect(screen.getByText('const answer = 42')).toBeInTheDocument()
  })

  it('renders inline code inside a paragraph', () => {
    render(
      <MessageContent
        format="text"
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
        text={'const total = items.length\nreturn total'}
        theme="dark"
      />,
    )

    expect(screen.getByText(/const total = items\.length/i)).toBeInTheDocument()
    expect(screen.getByText(/return total/i)).toBeInTheDocument()
  })
})
