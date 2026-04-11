import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('App theme integration', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('restores theme from localStorage', async () => {
    window.localStorage.setItem('mts-ai-theme', 'dark')

    render(<App />)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  it('toggles theme from the header switch', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('switch', { name: /переключить тему/i }))

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    expect(window.localStorage.getItem('mts-ai-theme')).toBe('dark')
  })
})
