import type { ChatPreview } from '../../../entities/chat'

export interface SidebarState {
  readonly chats: readonly ChatPreview[]
  readonly activeChatId: string | null
  readonly isOpen: boolean
  readonly isLoading: boolean
  readonly error: string | null
}

export type SidebarAction =
  | { type: 'loadStarted' }
  | {
      type: 'loadSucceeded'
      payload: readonly ChatPreview[]
    }
  | { type: 'loadFailed'; payload: string }
  | { type: 'chatSelected'; payload: string }
  | { type: 'chatCreated'; payload: ChatPreview }
  | { type: 'chatUpdated'; payload: ChatPreview }
  | { type: 'sidebarOpened' }
  | { type: 'sidebarClosed' }
