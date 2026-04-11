import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  it('reflects dark theme through switch semantics', () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />)

    expect(
      screen.getByRole('switch', { name: /переключить тему/i }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('calls toggle handler on click', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    render(<ThemeToggle theme="light" onToggle={onToggle} />)

    await user.click(screen.getByRole('switch', { name: /переключить тему/i }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders both theme labels', () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />)

    expect(screen.getByText(/светлая/i)).toBeInTheDocument()
    expect(screen.getByText(/тёмная/i)).toBeInTheDocument()
  })
})
