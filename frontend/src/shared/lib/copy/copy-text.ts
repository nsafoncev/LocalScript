export async function copyText(text: string): Promise<boolean> {
  if (!globalThis.navigator?.clipboard?.writeText) {
    return false
  }

  try {
    await globalThis.navigator.clipboard.writeText(text)
  } catch {
    return false
  }

  return true
}
