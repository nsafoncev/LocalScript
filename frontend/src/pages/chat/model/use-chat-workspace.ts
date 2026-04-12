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
import { httpClient } from '../../../shared/api'

const chatApi = createChatApi(httpClient)
const chatListApi = createChatListApi(httpClient)
const CHAT_ERROR_MESSAGE =
  'Не удалось получить ответ ассистента. Попробуйте ещё раз.'
const SIDEBAR_ERROR_MESSAGE = 'Не удалось загрузить список чатов.'
const SIDEBAR_MESSAGE_PREVIEW_LIMIT = 88

function getActiveChat(
  chats: readonly ChatPreview[],
  activeChatId: string | null,
): ChatPreview | null {
  return chats.find((chat) => chat.id === activeChatId) ?? null
}

function createPreviewText(text: string): string {
  const normalizedText = text.trim().replace(/\s+/g, ' ')

  return normalizedText.length > SIDEBAR_MESSAGE_PREVIEW_LIMIT
    ? `${normalizedText.slice(0, SIDEBAR_MESSAGE_PREVIEW_LIMIT)}...`
    : normalizedText
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
    const message = value.trim()

    if (!message) {
      return
    }

    let currentChat = getActiveChat(sidebarState.chats, sidebarState.activeChatId)

    if (!currentChat) {
      currentChat = createLocalChatPreview()

      sidebarDispatch({ type: 'chatCreated', payload: currentChat })
      chatDispatch({
        type: 'sessionRegistered',
        payload: {
          chatId: currentChat.id,
          messages: [],
        },
      })
    }

    const currentSession =
      chatState.sessions[currentChat.id] ?? initialChatSessionState

    if (currentSession.isPending) {
      return
    }

    const userMessage = createChatMessage('user', message)
    const queuedChatPreview = updateChatPreview(currentChat, {
      title: isDraftChat(currentChat) ? deriveChatTitle(message) : undefined,
      lastMessage: `Вы: ${message}`,
    })

    chatDispatch({
      type: 'sessionUpdated',
      payload: {
        chatId: currentChat.id,
        action: { type: 'messageQueued', payload: userMessage },
      },
    })
    chatDispatch({
      type: 'sessionUpdated',
      payload: {
        chatId: currentChat.id,
        action: { type: 'requestStarted' },
      },
    })
    sidebarDispatch({
      type: 'chatUpdated',
      payload: queuedChatPreview,
    })

    try {
      const response = await chatApi.sendMessage({
        prompt: message,
      })
      const assistantMessage = createChatMessage('assistant', response.code)

      chatDispatch({
        type: 'sessionUpdated',
        payload: {
          chatId: currentChat.id,
          action: { type: 'responseReceived', payload: assistantMessage },
        },
      })

      sidebarDispatch({
        type: 'chatUpdated',
        payload: updateChatPreview(queuedChatPreview, {
          lastMessage: createPreviewText(response.code),
        }),
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : CHAT_ERROR_MESSAGE

      chatDispatch({
        type: 'sessionUpdated',
        payload: {
          chatId: currentChat.id,
          action: {
            type: 'requestFailed',
            payload: errorMessage,
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
