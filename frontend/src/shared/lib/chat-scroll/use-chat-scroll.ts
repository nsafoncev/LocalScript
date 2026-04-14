import { useEffect, useRef, useState, type RefObject } from 'react'

const BOTTOM_THRESHOLD = 40

function isNearBottom(element: HTMLDivElement): boolean {
  const distanceToBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight

  return distanceToBottom <= BOTTOM_THRESHOLD
}

export interface UseChatScrollResult {
  readonly scrollContainerRef: RefObject<HTMLDivElement | null>
  readonly bottomAnchorRef: RefObject<HTMLDivElement | null>
  readonly isScrollButtonVisible: boolean
  handleScroll(): void
  scrollToBottom(): void
}

export function useChatScroll(
  messageCount: number,
  hasPendingContent: boolean,
): UseChatScrollResult {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false)

  function syncScrollState(): void {
    const container = scrollContainerRef.current

    if (!container) {
      shouldStickToBottomRef.current = true
      setIsScrollButtonVisible(false)
      return
    }

    const isAtBottom = isNearBottom(container)
    shouldStickToBottomRef.current = isAtBottom
    setIsScrollButtonVisible(!isAtBottom)
  }

  function scrollToBottom(): void {
    if (typeof bottomAnchorRef.current?.scrollIntoView === 'function') {
      bottomAnchorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }
  }

  function handleScroll(): void {
    syncScrollState()
  }

  useEffect(() => {
    const container = scrollContainerRef.current

    if (!container) {
      return
    }

    if (shouldStickToBottomRef.current) {
      scrollToBottom()
      shouldStickToBottomRef.current = true
      setIsScrollButtonVisible(false)
      return
    }

    syncScrollState()
  }, [hasPendingContent, messageCount])

  return {
    scrollContainerRef,
    bottomAnchorRef,
    isScrollButtonVisible,
    handleScroll,
    scrollToBottom,
  }
}
