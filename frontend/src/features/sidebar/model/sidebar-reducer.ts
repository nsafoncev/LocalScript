import type { SidebarAction, SidebarState } from './types'

export const initialSidebarState: SidebarState = {
  chats: [],
  activeChatId: null,
  isOpen: true,
  isLoading: false,
  error: null,
}

export function sidebarReducer(
  state: SidebarState,
  action: SidebarAction,
): SidebarState {
  switch (action.type) {
    case 'loadStarted':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'loadSucceeded':
      return {
        ...state,
        isLoading: false,
        error: null,
        chats: action.payload,
        activeChatId: action.payload[0]?.id ?? null,
      }
    case 'loadFailed':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }
    case 'chatSelected':
      return {
        ...state,
        activeChatId: action.payload,
      }
    case 'chatCreated':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        activeChatId: action.payload.id,
      }
    case 'chatUpdated':
      return {
        ...state,
        chats: state.chats
          .map((chat) => (chat.id === action.payload.id ? action.payload : chat))
          .sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
          ),
      }
    case 'sidebarOpened':
      return {
        ...state,
        isOpen: true,
      }
    case 'sidebarClosed':
      return {
        ...state,
        isOpen: false,
      }
    default:
      return state
  }
}
