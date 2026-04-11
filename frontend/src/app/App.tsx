import type { JSX } from 'react'
import { useTheme } from '../shared/lib/theme/use-theme'
import { ChatPage } from '../pages/chat'

export function App(): JSX.Element {
  const { theme, toggleTheme } = useTheme()

  return <ChatPage theme={theme} toggleTheme={toggleTheme} />
}
