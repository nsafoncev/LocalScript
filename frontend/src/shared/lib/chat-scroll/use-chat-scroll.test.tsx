import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useChatScroll } from './use-chat-scroll'

describe('useChatScroll', () => {
  it('shows the button when the user is not at the bottom', () => {
    const { result } = renderHook(() => useChatScroll(2, false))
    const container = document.createElement('div')

    Object.defineProperties(container, {
      scrollHeight: { configurable: true, value: 640 },
      scrollTop: { configurable: true, value: 120, writable: true },
      clientHeight: { configurable: true, value: 320 },
    })

    act(() => {
      result.current.scrollContainerRef.current = container
      result.current.handleScroll()
    })

    expect(result.current.isScrollButtonVisible).toBe(true)
  })

  it('scrolls to the latest message when requested', () => {
    const { result } = renderHook(() => useChatScroll(1, false))
    const scrollIntoView = vi.fn()
    const anchor = document.createElement('div')

    anchor.scrollIntoView = scrollIntoView

    act(() => {
      result.current.bottomAnchorRef.current = anchor
      result.current.scrollToBottom()
    })

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'end',
    })
  })
})
