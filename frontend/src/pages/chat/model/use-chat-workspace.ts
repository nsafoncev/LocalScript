import { useEffect, useReducer } from 'react'
import {
  createLocalChatPreview,
  deriveChatTitle,
  isDraftChat,
  updateChatPreview,
  type ChatPreview,
} from '../../../entities/chat'
import { createChatMessage, type ChatMessage } from '../../../entities/message'
import {
  chatSessionsReducer,
  createChatApi,
  initialChatSessionState,
  initialChatSessionsState,
} from '../../../features/chat'
import {
  createChatListApi,
  initialSidebarState,
  sidebarReducer,
} from '../../../features/sidebar'
import { httpClient } from '../../../shared/api/http-client'

const chatApi = createChatApi(httpClient)
const chatListApi = createChatListApi(httpClient)
const CHAT_ERROR_MESSAGE =
  'Не удалось получить ответ ассистента. Попробуйте ещё раз.'
const SIDEBAR_ERROR_MESSAGE = 'Не удалось загрузить список чатов.'

function createSeedMessages(chat: ChatPreview): readonly ChatMessage[] {
  return [createChatMessage('assistant', chat.lastMessage)]
}

function getActiveChat(
  chats: readonly ChatPreview[],
  activeChatId: string | null,
): ChatPreview | null {
  return chats.find((chat) => chat.id === activeChatId) ?? null
}

export interface UseChatWorkspaceResult {
  readonly chats: readonly ChatPreview[]
  readonly activeChatId: string | null
  readonly activeChatTitle: string
  readonly messages: readonly ChatMessage[]
  readonly isSidebarOpen: boolean
  readonly isSidebarLoading: boolean
  readonly sidebarError: string | null
  readonly chatError: string | null
  readonly isChatPending: boolean
  createChat(): void
  selectChat(chatId: string): void
  toggleSidebar(): void
  openSidebar(): void
  closeSidebar(): void
  sendMessage(value: string): Promise<void>
}

export function useChatWorkspace(): UseChatWorkspaceResult {
  const [sidebarState, sidebarDispatch] = useReducer(
    sidebarReducer,
    initialSidebarState,
  )
  const [chatState, chatDispatch] = useReducer(
    chatSessionsReducer,
    initialChatSessionsState,
  )

  useEffect(() => {
    let isMounted = true

    async function loadChats(): Promise<void> {
      sidebarDispatch({ type: 'loadStarted' })

      try {
        const chats = await chatListApi.getChats()

        if (!isMounted) {
          return
        }

        sidebarDispatch({ type: 'loadSucceeded', payload: chats })

        chats.forEach((chat) => {
          chatDispatch({
            type: 'sessionRegistered',
            payload: {
              chatId: chat.id,
              messages: createSeedMessages(chat),
            },
          })
        })
      } catch {
        if (!isMounted) {
          return
        }

        sidebarDispatch({
          type: 'loadFailed',
          payload: SIDEBAR_ERROR_MESSAGE,
        })
      }
    }

    void loadChats()

    return () => {
      isMounted = false
    }
  }, [])

  const activeChat = getActiveChat(sidebarState.chats, sidebarState.activeChatId)
  const activeSession = sidebarState.activeChatId
    ? chatState.sessions[sidebarState.activeChatId] ?? initialChatSessionState
    : initialChatSessionState

  function createChat(): void {
    const chat = createLocalChatPreview()

    sidebarDispatch({ type: 'chatCreated', payload: chat })
    chatDispatch({
      type: 'sessionRegistered',
      payload: {
        chatId: chat.id,
        messages: [],
      },
    })
  }

  function selectChat(chatId: string): void {
    sidebarDispatch({ type: 'chatSelected', payload: chatId })
  }

  function openSidebar(): void {
    sidebarDispatch({ type: 'sidebarOpened' })
  }

  function closeSidebar(): void {
    sidebarDispatch({ type: 'sidebarClosed' })
  }

  function toggleSidebar(): void {
    if (sidebarState.isOpen) {
      closeSidebar()
      return
    }

    openSidebar()
  }

  async function sendMessage(value: string): Promise<void> {
    const activeChatId = sidebarState.activeChatId
    const message = value.trim()

    if (!activeChatId || !message || activeSession.isPending) {
      return
    }

    const currentChat = getActiveChat(sidebarState.chats, activeChatId)

    if (!currentChat) {
      return
    }

    const userMessage = createChatMessage('user', message)
    const nextHistory = [...activeSession.messages, userMessage]

    chatDispatch({
      type: 'sessionUpdated',
      payload: {
        chatId: activeChatId,
        action: { type: 'messageQueued', payload: userMessage },
      },
    })
    chatDispatch({
      type: 'sessionUpdated',
      payload: {
        chatId: activeChatId,
        action: { type: 'requestStarted' },
      },
    })

    sidebarDispatch({
      type: 'chatUpdated',
      payload: updateChatPreview(currentChat, {
        title: isDraftChat(currentChat) ? deriveChatTitle(message) : undefined,
        lastMessage: `Вы: ${message}`,
      }),
    })

    try {
      const response = await chatApi.sendMessage({
        chatId: activeChatId,
        message,
        history: nextHistory,
      })

      chatDispatch({
        type: 'sessionUpdated',
        payload: {
          chatId: activeChatId,
          action: { type: 'responseReceived', payload: response.message },
        },
      })

      sidebarDispatch({
        type: 'chatUpdated',
        payload: updateChatPreview(currentChat, {
          title: isDraftChat(currentChat) ? deriveChatTitle(message) : undefined,
          lastMessage: response.message.text,
        }),
      })
    } catch {
      chatDispatch({
        type: 'sessionUpdated',
        payload: {
          chatId: activeChatId,
          action: {
            type: 'requestFailed',
            payload: CHAT_ERROR_MESSAGE,
          },
        },
      })
    }
  }

  return {
    chats: sidebarState.chats,
    activeChatId: sidebarState.activeChatId,
    activeChatTitle: activeChat?.title ?? 'Новый чат',
    messages: activeSession.messages,
    isSidebarOpen: sidebarState.isOpen,
    isSidebarLoading: sidebarState.isLoading,
    sidebarError: sidebarState.error,
    chatError: activeSession.error,
    isChatPending: activeSession.isPending,
    createChat,
    selectChat,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    sendMessage,
  }
}
