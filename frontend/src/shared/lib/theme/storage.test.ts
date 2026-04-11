import { afterEach, describe, expect, it } from 'vitest'
import { applyTheme, getStoredTheme, persistTheme } from './storage'

describe('theme storage helpers', () => {
  afterEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('returns light theme by default', () => {
    expect(getStoredTheme()).toBe('light')
  })

  it('persists theme in localStorage', () => {
    persistTheme('dark')

    expect(window.localStorage.getItem('mts-ai-theme')).toBe('dark')
  })

  it('applies theme to document root', () => {
    applyTheme('dark')

    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
