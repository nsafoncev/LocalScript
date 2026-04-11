import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, persistTheme } from './storage'
import type { AppTheme } from './types'

export interface UseThemeResult {
  readonly theme: AppTheme
  toggleTheme(): void
}

export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(theme)
    persistTheme(theme)
  }, [theme])

  function toggleTheme(): void {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light',
    )
  }

  return {
    theme,
    toggleTheme,
  }
}
