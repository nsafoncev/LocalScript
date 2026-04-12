import { CanceledError } from 'axios'

export function isRequestCancelled(error: unknown): boolean {
  if (error instanceof CanceledError) {
    return true
  }

  if (error instanceof DOMException) {
    return error.name === 'AbortError'
  }

  return error instanceof Error && error.name === 'CanceledError'
}
