import { describe, expect, it, vi } from 'vitest'
import { copyText } from './copy-text'

describe('copyText', () => {
  it('copies text through clipboard api', async () => {
    const writeText = vi.fn(async () => undefined)

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })

    await expect(copyText('console.log("test")')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('console.log("test")')
  })
})
