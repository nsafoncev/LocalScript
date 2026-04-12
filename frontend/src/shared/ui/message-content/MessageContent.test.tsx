import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MessageContent } from './MessageContent'

describe('MessageContent', () => {
  it('renders fenced code blocks', () => {
    render(<MessageContent text={'```ts\nconst answer = 42\n```'} />)

    expect(screen.getByText('const answer = 42')).toBeInTheDocument()
  })

  it('renders inline code inside a paragraph', () => {
    render(<MessageContent text="Запустите `npm run dev` и проверьте результат." />)

    expect(screen.getByText('npm run dev')).toBeInTheDocument()
    expect(screen.getByText(/запустите/i)).toBeInTheDocument()
  })

  it('wraps raw assistant code into a code block automatically', () => {
    render(<MessageContent text={'const total = items.length\nreturn total'} />)

    expect(screen.getByText(/const total = items\.length/i)).toBeInTheDocument()
    expect(screen.getByText(/return total/i)).toBeInTheDocument()
  })
})
