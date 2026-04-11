import { DEFAULT_THEME, THEME_STORAGE_KEY } from './constants'
import type { AppTheme } from './types'

function isTheme(value: string): value is AppTheme {
  return value === 'dark' || value === 'light'
}

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return storedTheme && isTheme(storedTheme) ? storedTheme : DEFAULT_THEME
}

export function persistTheme(theme: AppTheme): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme
}
